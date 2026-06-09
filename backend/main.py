"""관계 심리 분석 API.

A 사용자가 입력한 B의 정보(프로필 + 대화)를 바탕으로,
LLM을 호출해 B의 성격/감정/예상 답변을 분석합니다.

핵심: ML 모델을 직접 학습하지 않고, 잘 만든 프롬프트로 LLM에게 분석을 위임합니다.

LLM 제공자는 환경변수 LLM_PROVIDER 로 전환합니다.
- "gemini" (기본): Google Gemini. 무료 키 발급 가능 (카드 불필요).
- "openai": OpenAI GPT.
"""

import json
import os
import time

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

load_dotenv()

# 무료 테스트가 쉬운 Gemini를 기본값으로 둡니다.
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini").lower()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# 무료 한도(분당 입력 토큰)를 넘지 않도록 대화 길이를 제한합니다.
# 너무 길면 가장 "최근" 대화만 사용합니다.
MAX_CONVERSATION_CHARS = int(os.getenv("MAX_CONVERSATION_CHARS", "40000"))

# 앱에서는 절대 API 키를 두지 않고, 이 백엔드 서버에만 둡니다(보안).
# 키가 없어도 서버는 뜨도록, 클라이언트는 요청 시점에 만듭니다(lazy).
_openai_client = None
_gemini_client = None


def get_openai_client():
    global _openai_client
    if _openai_client is None:
        from openai import OpenAI

        _openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _openai_client


def get_gemini_client():
    global _gemini_client
    if _gemini_client is None:
        from google import genai

        _gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    return _gemini_client


def call_llm(user_prompt: str) -> dict:
    """선택된 제공자로 LLM을 호출하고 JSON(dict)을 반환."""
    if LLM_PROVIDER == "openai":
        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY가 설정되지 않았습니다. backend/.env 파일을 확인하세요.",
            )
        completion = get_openai_client().chat.completions.create(
            model=OPENAI_MODEL,
            response_format={"type": "json_object"},
            temperature=0.7,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
        return json.loads(completion.choices[0].message.content or "{}")

    # 기본: Gemini
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY가 설정되지 않았습니다. backend/.env 파일을 확인하세요. (무료 키: https://aistudio.google.com/app/apikey)",
        )
    from google.genai import types

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        response_mime_type="application/json",
        temperature=0.7,
    )

    # 무료 모델은 가끔 503(일시적 과부하)을 냅니다. 몇 번 자동 재시도.
    last_exc: Exception | None = None
    for attempt in range(4):
        try:
            resp = get_gemini_client().models.generate_content(
                model=GEMINI_MODEL,
                contents=user_prompt,
                config=config,
            )
            return json.loads(resp.text or "{}")
        except Exception as exc:
            msg = str(exc)
            if "503" in msg or "UNAVAILABLE" in msg or "overloaded" in msg:
                last_exc = exc
                time.sleep(2 * (attempt + 1))
                continue
            if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
                raise HTTPException(
                    status_code=429,
                    detail="무료 사용량 한도를 초과했어요. 대화 양을 줄이거나 약 1분 뒤 다시 시도해 주세요.",
                )
            raise
    raise last_exc if last_exc else RuntimeError("알 수 없는 오류")


app = FastAPI(title="관계 심리 분석 API", version="0.1.0")

# 개발 단계: 모든 출처 허용. 배포 시에는 앱 도메인만 허용하도록 좁히세요.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    name: str = Field(..., description="분석 대상(B)의 이름 또는 별칭")
    age: int | None = Field(None, description="나이")
    gender: str | None = Field(None, description="성별")
    relationship: str | None = Field(
        None, description="나(A)와 B의 관계 예: 연인, 친구, 직장 동료"
    )
    conversation: str = Field(
        "", description="카카오톡 등에서 나눈 대화 텍스트(붙여넣기)"
    )
    question: str | None = Field(
        None, description="B에게 직접 묻고 싶은 질문 (선택)"
    )


class AnalyzeResponse(BaseModel):
    personality: str  # 성격 요약
    emotional_state: str  # 현재 감정/심리 추정
    predicted_answer: str  # question에 대한 B의 예상 답변
    advice: str  # A에게 주는 관계 조언
    caution: str  # 분석의 한계/주의사항


SYSTEM_PROMPT = """당신은 신중하고 공감 능력이 뛰어난 심리 분석가입니다.
사용자(A)가 제공한 상대방(B)의 프로필과 대화 내용을 바탕으로 B의 심리를 추정합니다.

반드시 지킬 것:
- 단정하지 말고 "~로 보입니다", "~일 가능성이 있습니다"처럼 추정 표현을 사용합니다.
- 제공된 데이터에 근거해서만 분석하고, 근거가 부족하면 솔직히 말합니다.
- 진단(질병 등)이나 단정적 낙인을 찍지 않습니다.
- 한국어로, 따뜻하지만 솔직하게 답합니다.

반드시 아래 JSON 형식으로만 응답하세요:
{
  "personality": "B의 성격 특징 요약",
  "emotional_state": "대화에서 드러나는 B의 현재 감정/심리 추정",
  "predicted_answer": "A의 질문에 대해 B가 할 법한 예상 답변(질문이 없으면 빈 문자열)",
  "advice": "A가 B와의 관계에서 참고할 만한 조언",
  "caution": "이 분석의 한계와 주의사항"
}"""


def build_user_prompt(req: AnalyzeRequest) -> str:
    profile_lines = [f"- 이름/별칭: {req.name}"]
    if req.age is not None:
        profile_lines.append(f"- 나이: {req.age}")
    if req.gender:
        profile_lines.append(f"- 성별: {req.gender}")
    if req.relationship:
        profile_lines.append(f"- 나(A)와의 관계: {req.relationship}")

    parts = ["[B의 프로필]", "\n".join(profile_lines)]

    conversation = req.conversation.strip()
    if conversation:
        if len(conversation) > MAX_CONVERSATION_CHARS:
            # 가장 최근 대화가 더 중요하므로 뒷부분(최근)을 남깁니다.
            conversation = conversation[-MAX_CONVERSATION_CHARS:]
            parts += [
                "\n[A와 B가 나눈 대화] (분량이 많아 가장 최근 대화만 사용)",
                conversation,
            ]
        else:
            parts += ["\n[A와 B가 나눈 대화]", conversation]
    else:
        parts += ["\n[대화 데이터]", "(제공되지 않음)"]

    if req.question and req.question.strip():
        parts += ["\n[A가 B에게 묻고 싶은 질문]", req.question.strip()]

    parts.append(
        "\n위 정보를 바탕으로 B의 심리를 분석하고 지정된 JSON 형식으로 답하세요."
    )
    return "\n".join(parts)


@app.get("/health")
def health() -> dict:
    model = GEMINI_MODEL if LLM_PROVIDER != "openai" else OPENAI_MODEL
    return {"status": "ok", "provider": LLM_PROVIDER, "model": model}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    try:
        data = call_llm(build_user_prompt(req))
    except HTTPException:
        raise
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="LLM 응답을 해석하지 못했습니다.")
    except Exception as exc:  # LLM API 오류 등
        raise HTTPException(status_code=502, detail=f"분석 중 오류: {exc}")

    return AnalyzeResponse(
        personality=data.get("personality", ""),
        emotional_state=data.get("emotional_state", ""),
        predicted_answer=data.get("predicted_answer", ""),
        advice=data.get("advice", ""),
        caution=data.get("caution", ""),
    )

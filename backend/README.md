# 관계 심리 분석 백엔드 (FastAPI)

앱(React Native)에서 보낸 B의 정보를 받아 OpenAI LLM으로 심리를 분석해 돌려주는 서버입니다.
**API 키는 앱이 아니라 이 서버에만 둡니다(보안).**

## 1. 준비

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 2. 키 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 `OPENAI_API_KEY` 에 본인 키를 넣으세요.
(키 발급: https://platform.openai.com/api-keys — 회원가입 + 결제수단 등록 필요)

## 3. 실행

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- 헬스 체크: http://localhost:8000/health
- API 문서(자동 생성): http://localhost:8000/docs

## 4. 테스트 (curl)

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "name": "민수",
    "age": 28,
    "gender": "남성",
    "relationship": "썸 타는 사이",
    "conversation": "나: 오늘 뭐해?\n민수: 그냥 집에 있어 ㅎㅎ 너는?\n나: 나도. 심심하다\n민수: 그럼 영화나 볼까?",
    "question": "민수가 나한테 호감이 있을까?"
  }'
```

## API

### POST /analyze
요청 본문:
| 필드 | 타입 | 설명 |
| --- | --- | --- |
| name | string | B의 이름/별칭 (필수) |
| age | number? | 나이 |
| gender | string? | 성별 |
| relationship | string? | A와 B의 관계 |
| conversation | string | 대화 텍스트 |
| question | string? | B에게 묻고 싶은 질문 |

응답: `personality`, `emotional_state`, `predicted_answer`, `advice`, `caution`

## 주의
타인의 대화는 민감한 개인정보입니다. 동의된 데이터 또는 테스트 데이터로만 사용하세요.

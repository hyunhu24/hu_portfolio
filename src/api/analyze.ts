import { API_BASE_URL } from '../config';

export type AnalyzeRequest = {
  name: string;
  age?: number;
  gender?: string;
  relationship?: string;
  conversation: string;
  question?: string;
};

export type AnalyzeResponse = {
  personality: string;
  emotional_state: string;
  predicted_answer: string;
  advice: string;
  caution: string;
};

export async function analyzeRelationship(
  payload: AnalyzeRequest,
): Promise<AnalyzeResponse> {
  // 연결이 안 되면 무한 대기하지 않도록 타임아웃(60초)을 둡니다.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(
        '서버 응답이 없어요(시간 초과). 백엔드가 켜져 있는지, 같은 와이파이인지, 주소(IP)가 맞는지 확인하세요.',
      );
    }
    throw new Error(
      `서버에 연결할 수 없어요 (${API_BASE_URL}). 백엔드 실행 여부와 IP를 확인하세요.`,
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    let detail = `요청 실패 (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }
    throw new Error(detail);
  }

  return (await res.json()) as AnalyzeResponse;
}

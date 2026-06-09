// 백엔드(FastAPI) 주소.
// 실제 휴대폰(Expo Go)에서 접속하려면 'localhost'가 아니라
// 맥(서버 PC)의 같은 와이파이 내 IP 주소를 써야 합니다.
//
// 맥 IP 확인: 터미널에서  ipconfig getifaddr en0
// 네트워크(와이파이)가 바뀌면 이 값도 바꿔주세요.
const LAN_IP = '10.32.25.15';

export const API_BASE_URL = `http://${LAN_IP}:8000`;

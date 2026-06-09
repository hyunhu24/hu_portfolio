export type Project = {
  id: string;
  title: string;
  description: string;
  stack: string[];
  // 'relationship': 앱 내부 관계 분석 화면 / 'webview': 인앱 WebView로 webUrl 열기
  action?: 'relationship' | 'webview';
  // action이 'webview'일 때 앱 안에서 열 웹 주소.
  webUrl?: string;
  // 외부 링크가 있으면 상세 화면에서 브라우저로 열 수 있습니다.
  url?: string;
  highlight?: boolean;
};

// 맥에서 Cloudflare 터널로 공개한 임시 베이스 주소.
// ⚠️ 터널을 재시작하면 이 주소가 바뀌므로, 그때마다 아래 BASE 한 줄만 바꾸면 됩니다.
// (맥 + serve + cloudflared 가 켜져 있는 동안만 동작. 영구 공개는 별도 호스팅/스토어 권장)
const TUNNEL_BASE = 'https://conservative-structured-antibody-defining.trycloudflare.com';

// Zigtruck 안드로이드 APK 공개 다운로드 주소.
export const ZIGTRUCK_APK_URL = `${TUNNEL_BASE}/zigtruck.apk`;

// hu_portfolio 상세에서 열 포트폴리오 PDF 주소 (Google Drive 공유 링크 - 영구 주소).
// 브라우저에서 열면 드라이브 뷰어가 PDF를 바로 렌더링해줍니다.
export const PORTFOLIO_PDF_URL =
  'https://drive.google.com/file/d/1HndL9ptyzFX5qo6aXvkoMzaoUKkY12Y3/view?usp=sharing';

// PDF를 브라우저/웹뷰에서 인라인으로 렌더링하기 위한 Google 문서 뷰어 래퍼.
// (안드로이드는 PDF를 직접 렌더링하지 않아 다운로드되므로 이 뷰어로 감쌉니다.)
export function pdfViewerUrl(fileUrl: string): string {
  return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;
}

export const PROJECTS: Project[] = [
  {
    id: 'relationship',
    title: '관계 분석 AI',
    description: '상대방 정보와 대화를 입력하면 AI가 심리를 분석해줘요.',
    stack: ['Python', 'FastAPI', 'OpenAI'],
    action: 'relationship',
    highlight: true,
  },
  {
    id: 'zigtruck',
    title: 'Zigtruck App',
    description:
      '실시간 화물 매칭 모바일 앱 (직트럭). 아래 버튼으로 안드로이드 APK를 받아 설치할 수 있어요.',
    stack: ['Expo', 'React Native', 'Firebase'],
    url: ZIGTRUCK_APK_URL,
  },
  {
    id: 'hu_portfolio',
    title: 'hu_portfolio',
    description: '나를 소개하는 포트폴리오. 아래 버튼으로 PDF를 열어볼 수 있어요.',
    stack: ['React', 'Vercel'],
    url: PORTFOLIO_PDF_URL,
  },
  {
    id: 'cookking',
    title: 'Cookking',
    description: '요리/레시피 웹 서비스 (cooKKing).',
    stack: ['Web'],
    url: 'https://www.cookkking.com/',
  },
  {
    id: 'damo',
    title: '다모',
    description: '다모 앱. 아래 버튼으로 안드로이드 APK를 받아 설치할 수 있어요.',
    stack: ['React Native', 'Expo'],
    url: 'https://expo.dev/artifacts/eas/dL192bAoVYmPWupTggx29Q.apk',
  },
];

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';

// 앱 로고와 같은 숫자용 폰트 (라틴/숫자 전용)
const akira = localFont({
  src: './fonts/Akira-Expanded.otf',
  variable: '--font-akira',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '지갑교관 스튜디오',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${akira.variable} min-h-screen bg-paper text-ink antialiased`}
      style={{ fontFamily: '"Pretendard Variable", Pretendard, -apple-system, sans-serif' }}
    >
      {children}
    </div>
  );
}

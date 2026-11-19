import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '지갑교관 콘텐츠 관리',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50 text-gray-900">{children}</div>;
}

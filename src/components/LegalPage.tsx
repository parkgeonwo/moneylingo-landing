import Link from 'next/link';
import Image from 'next/image';

interface LegalPageProps {
  /** 문서 언어 (스크린리더·번역기용) */
  lang: 'ko' | 'ja';
  appName: string;
  homeLabel: string;
  title: string;
  /** 시행일 등 제목 아래 한 줄 */
  effectiveDate: string;
  footer: string;
  children: React.ReactNode;
}

/** 약관·개인정보 페이지 공통 틀 (헤더 + 본문 + 하단) */
export default function LegalPage({
  lang,
  appName,
  homeLabel,
  title,
  effectiveDate,
  footer,
  children,
}: LegalPageProps) {
  const home = lang === 'ja' ? '/ja' : '/';
  return (
    <div lang={lang}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={home} className="flex items-center gap-2">
              <Image src="/images/logo.png" alt={appName} width={32} height={32} className="rounded-lg" />
              <span className="font-bold text-xl text-gray-900">{appName}</span>
            </Link>
            <Link href={home} className="text-gray-600 hover:text-gray-900 transition-colors">
              {homeLabel}
            </Link>
          </div>
        </nav>
      </header>

      <main className="pt-24 pb-16 bg-white">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-600 leading-relaxed">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{title}</h1>
          <p className="text-gray-700 mb-10">
            <strong>{effectiveDate}</strong>
          </p>
          {children}
        </article>
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 py-8">
        <p className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">{footer}</p>
      </footer>
    </div>
  );
}

/** 본문용 작은 부품 */
export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">{children}</h2>;
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{children}</h3>;
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>;
}

export function OL({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>;
}

export function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50">
            {head.map((cell) => (
              <th key={cell} className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-800">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-gray-200 px-3 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

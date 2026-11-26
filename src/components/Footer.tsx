import Link from 'next/link';
import Image from 'next/image';

const BUSINESS_INFO: { label: string; value: string; href?: string }[] = [
  { label: '상호', value: '82스튜디오' },
  { label: '주소', value: '서울 서초구 강남대로83길 (반포동 732-18)' },
  { label: '대표자', value: '박건우' },
  { label: '사업자등록번호', value: '629-24-02028' },
  { label: '통신판매신고번호', value: '2025-서울서초-3296' },
  { label: '개인정보관리책임자', value: '박건우' },
  { label: '고객센터', value: '82studio.xyz@gmail.com', href: 'mailto:82studio.xyz@gmail.com' },
  { label: '전화', value: '010-9474-3580', href: 'tel:010-9474-3580' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/images/logo.png"
                alt="지갑교관 로고"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-xl text-white">지갑교관</span>
            </Link>
            <p className="text-sm leading-relaxed">
              당신의 통장을 지키는 가장 확실한 훈련
            </p>
          </div>
        </div>

        {/* 사업자 정보 */}
        <dl className="mt-8 flex flex-wrap gap-x-4 gap-y-1.5 text-xs leading-relaxed break-keep">
          {BUSINESS_INFO.map(({ label, value, href }) => (
            <div key={label} className="flex gap-1.5">
              <dt className="text-gray-500">{label}</dt>
              <dd className="text-gray-300">
                {href ? (
                  <a href={href} className="hover:text-white transition-colors">
                    {value}
                  </a>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            Copyright &copy; 2026 82STUDIO
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="#features" className="hover:text-white transition-colors">
              기능
            </Link>
            <Link href="#faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="#download" className="hover:text-white transition-colors">
              다운로드
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              개인정보 처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

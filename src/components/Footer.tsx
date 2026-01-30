import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
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

          {/* Contact Info */}
          <div className="text-right">
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">대표</span>{' '}
                <span className="text-gray-300">박건우 유다연</span>
              </p>
              <p>
                <span className="text-gray-500">이메일</span>{' '}
                <a
                  href="mailto:ceo@82studio.xyz"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  ceo@82studio.xyz
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; 2025 지갑교관. All rights reserved.
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

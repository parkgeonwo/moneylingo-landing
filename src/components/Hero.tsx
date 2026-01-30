import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="pt-20 pb-16 md:pt-24 md:pb-24 min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.png"
          alt="지갑교관 배경"
          fill
          className="object-cover object-bottom"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-8">
              아직도 작심삼일
              <br />
              가계부입니까?
            </h1>

            <p className="text-lg md:text-xl text-gray-700 mb-1 leading-relaxed">
              기록하기 귀찮고, 내가 얼마나 썼는지 감도 안 잡히는 소비 생활.
            </p>

            <p className="text-lg md:text-xl text-gray-700 mb-1 leading-relaxed">
              이제 <span className="font-bold text-gray-900">지갑교관</span>이 당신의 소비 습관을 뜯어고쳐 드립니다.
            </p>

            <p className="text-lg md:text-xl text-gray-700 mb-10 leading-relaxed">
              단순한 기록을 넘어, <span className="font-bold text-emerald-600">절약 습관</span>을 만들어주는 훈련이 시작됩니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="#download"
                className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg"
              >
                <span>훈련 시작하기</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

          </div>

          {/* Phone Mockup */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-64 md:w-72 lg:w-80">
              <Image
                src="/images/phone-mockup.png"
                alt="지갑교관 앱 화면"
                width={400}
                height={800}
                className="drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

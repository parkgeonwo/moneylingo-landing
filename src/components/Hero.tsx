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

            <p className="text-lg md:text-xl text-gray-700 mb-1 leading-relaxed break-keep">
              <span className="block sm:inline">기록하기 귀찮고, </span>
              <span className="block text-balance sm:inline">내가 얼마나 썼는지 감도 안 잡히는 소비 생활.</span>
            </p>

            <p className="text-lg md:text-xl text-gray-700 leading-relaxed break-keep">
              <span className="block sm:inline">
                이제 <span className="font-bold text-gray-900">지갑교관</span>이{' '}
              </span>
              <span className="block text-balance sm:inline">당신의 소비 습관을 뜯어고쳐 드립니다.</span>
            </p>
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

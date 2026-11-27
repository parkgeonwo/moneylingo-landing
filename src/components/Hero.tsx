import Image from 'next/image';
import type { LandingContent } from '@/content/landing';

export default function Hero({ c }: { c: LandingContent['hero'] }) {
  return (
    <section className="pt-20 pb-16 md:pt-24 md:pb-24 min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/hero-bg.png" alt={c.bgAlt} fill className="object-cover object-bottom" priority />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-8">{c.title}</h1>
            <p className="text-lg md:text-xl text-gray-700 mb-1 leading-relaxed break-keep">{c.lead1}</p>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed break-keep">{c.lead2}</p>
          </div>

          {/* Phone Mockup */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative w-64 md:w-72 lg:w-80">
              <Image src={c.phoneSrc} alt={c.phoneAlt} width={400} height={800} className="drop-shadow-2xl" priority />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

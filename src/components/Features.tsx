import Image from 'next/image';
import type { LandingContent } from '@/content/landing';

/** 기능 3개는 같은 틀: 뱃지 색·이미지 크기·좌우 배치만 다름 */
const LAYOUT = [
  { badge: 'bg-red-100 text-red-700', imageLeft: false, box: 'max-w-md', w: 500, h: 600 },
  { badge: 'bg-blue-100 text-blue-700', imageLeft: true, box: 'max-w-md', w: 500, h: 600 },
  { badge: 'bg-orange-100 text-orange-700', imageLeft: false, box: 'max-w-sm', w: 400, h: 700 },
];

export default function Features({ features, character }: Pick<LandingContent, 'features' | 'character'>) {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {features.map((f, i) => {
          const l = LAYOUT[i];
          return (
            <div key={f.imageSrc} className="flex flex-col lg:flex-row items-center gap-12 mb-32">
              <div className={`flex-1 ${l.imageLeft ? '' : 'order-2 lg:order-1'}`}>
                {l.imageLeft ? <FeatureImage f={f} l={l} /> : <FeatureText f={f} badge={l.badge} />}
              </div>
              <div className={`flex-1 ${l.imageLeft ? '' : 'order-1 lg:order-2'}`}>
                {l.imageLeft ? <FeatureText f={f} badge={l.badge} /> : <FeatureImage f={f} l={l} />}
              </div>
            </div>
          );
        })}

        {/* 캐릭터 소개 */}
        <div className="flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-emerald-50 to-amber-50 rounded-3xl p-8 lg:p-16">
          <div className="flex-1">
            <div className="relative max-w-sm mx-auto">
              <Image src={character.imageSrc} alt={character.imageAlt} width={400} height={500} className="rounded-2xl" />
            </div>
          </div>
          <div className="flex-1">
            <span className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
              {character.badge}
            </span>
            <div className="space-y-6">
              {character.rows.map((row) => (
                <div key={row.label}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{row.label}</h3>
                  <p className="text-gray-600">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type Feature = LandingContent['features'][number];

function FeatureText({ f, badge }: { f: Feature; badge: string }) {
  return (
    <>
      <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 ${badge}`}>{f.badge}</span>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{f.title}</h2>
      <p className="text-lg text-gray-600 leading-relaxed">{f.body}</p>
    </>
  );
}

function FeatureImage({ f, l }: { f: Feature; l: (typeof LAYOUT)[number] }) {
  return (
    <div className={`relative ${l.box} mx-auto`}>
      <Image src={f.imageSrc} alt={f.imageAlt} width={l.w} height={l.h} className="rounded-3xl shadow-2xl" />
    </div>
  );
}

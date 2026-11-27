import Image from 'next/image';
import StoreButtons from './StoreButtons';
import type { LandingContent } from '@/content/landing';

export default function CTA({ c, store }: { c: LandingContent['cta']; store: LandingContent['store'] }) {
  return (
    <section id="download" className="py-20 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Mascot */}
        <div className="mb-8">
          <Image
            src="/images/mascot.png"
            alt={c.mascotAlt}
            width={200}
            height={200}
            className="mx-auto"
          />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {c.title}
        </h2>

        <p className="text-xl text-gray-300 mb-4 font-medium">
          {c.lead}
        </p>

        <p className="text-lg text-gray-400 mb-10">
          {c.body}
        </p>

        <div className="mb-8">
          <StoreButtons store={store} />
        </div>

        <p className="text-gray-500 text-sm">
          {c.note}
        </p>
      </div>
    </section>
  );
}

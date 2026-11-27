import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import StoreBar from '@/components/StoreBar';
import type { LandingContent } from '@/content/landing';

/** 랜딩 페이지 전체 (언어별 문구만 바꿔 끼움) */
export default function LandingPage({ c }: { c: LandingContent }) {
  return (
    <div lang={c.locale}>
      <Header locale={c.locale} home={c.home} appName={c.appName} logoAlt={c.logoAlt} nav={c.nav} />
      <main>
        <Hero c={c.hero} />
        <Features features={c.features} character={c.character} />
        <FAQ {...c.faq} />
        <CTA c={c.cta} store={c.store} />
      </main>
      <Footer home={c.home} appName={c.appName} logoAlt={c.logoAlt} c={c.footer} />
      <StoreBar store={c.store} />
    </div>
  );
}

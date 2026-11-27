import type { Metadata } from 'next';
import LandingPage from '@/components/LandingPage';
import { ja } from '@/content/landing';

const TITLE = '財布教官 - 三日坊主のための家計簿';
const DESCRIPTION =
  '記録するだけの家計簿は、もう卒業。使いすぎを叱ってくれる財布教官が、あなたの浪費グセを叩き直します。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['家計簿', 'かけいぼ', '節約', '貯金', '予算管理', '支出管理', '家計簿アプリ', '財布教官'],
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', locale: 'ja_JP' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function JaHome() {
  return <LandingPage c={ja} />;
}

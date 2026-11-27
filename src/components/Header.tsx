'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { LandingContent, Locale } from '@/content/landing';

interface HeaderProps {
  locale: Locale;
  home: string;
  appName: string;
  logoAlt: string;
  nav: LandingContent['nav'];
}

const LOCALES: { locale: Locale; label: string; href: string }[] = [
  { locale: 'ko', label: 'KR', href: '/' },
  { locale: 'ja', label: 'JP', href: '/ja' },
];

/** 한국어 ↔ 일본어 전환 */
function LocaleToggle({ current }: { current: Locale }) {
  return (
    <div className="flex items-center rounded-lg bg-gray-100 p-0.5 text-sm font-semibold">
      {LOCALES.map(({ locale, label, href }) => (
        <Link
          key={locale}
          href={href}
          hrefLang={locale}
          aria-current={locale === current ? 'page' : undefined}
          onClick={() => {
            // 직접 고른 언어를 1년간 기억 → 일본어 브라우저 자동 이동(proxy.ts)보다 우선
            document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
          }}
          className={`rounded-md px-2.5 py-1 transition-colors ${
            locale === current ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export default function Header({ locale, home, appName, logoAlt, nav }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={home} className="flex items-center gap-2">
            <Image src="/images/logo.png" alt={logoAlt} width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-xl text-gray-900">{appName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              {nav.features}
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors">
              {nav.faq}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <LocaleToggle current={locale} />
            <Link
              href="#download"
              className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              {nav.download}
            </Link>
          </div>

          {/* Mobile: 언어 토글 + 메뉴 버튼 */}
          <div className="flex items-center gap-2 md:hidden">
            <LocaleToggle current={locale} />
            <button className="p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={nav.menuOpen}>
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors" onClick={() => setIsMenuOpen(false)}>
                {nav.features}
              </Link>
              <Link href="#faq" className="text-gray-600 hover:text-gray-900 transition-colors" onClick={() => setIsMenuOpen(false)}>
                {nav.faq}
              </Link>
              <Link
                href="#download"
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {nav.download}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

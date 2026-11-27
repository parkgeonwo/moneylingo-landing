import Link from 'next/link';
import Image from 'next/image';
import type { LandingContent } from '@/content/landing';

interface FooterProps {
  home: string;
  appName: string;
  logoAlt: string;
  c: LandingContent['footer'];
}

export default function Footer({ home, appName, logoAlt, c }: FooterProps) {
  return (
    <footer className="bg-gray-950 text-gray-400 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand */}
          <div>
            <Link href={home} className="flex items-center gap-2 mb-4">
              <Image src="/images/logo.png" alt={logoAlt} width={32} height={32} className="rounded-lg" />
              <span className="font-bold text-xl text-white">{appName}</span>
            </Link>
            <p className="text-sm leading-relaxed">{c.tagline}</p>
          </div>
        </div>

        {/* 사업자 정보 */}
        <dl className="mt-8 flex flex-wrap gap-x-4 gap-y-1.5 text-xs leading-relaxed break-keep">
          {c.info.map(({ label, value, href }) => (
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
          <p className="text-sm text-gray-500">Copyright &copy; 2026 82STUDIO</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            {c.links.map(({ label, href }) => (
              <Link key={href} href={href} className="hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

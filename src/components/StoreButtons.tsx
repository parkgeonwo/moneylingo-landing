export const APP_STORE_URL =
  'https://apps.apple.com/kr/app/%EC%A7%80%EA%B0%91%EA%B5%90%EA%B4%80/id6756384444';
export const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=io.github.parkgeonwo.moneylingo&pcampaignid=web_share';

function AppleIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );
}

/**
 * 앱스토어 / 플레이스토어 버튼 한 쌍
 * - large: 하단 CTA 섹션 (어두운 배경 위 흰 버튼)
 * - compact: 하단 고정 바 (가로 2개, 밝은 배경 위 검정 버튼)
 */
export default function StoreButtons({ variant = 'large' }: { variant?: 'large' | 'compact' }) {
  const compact = variant === 'compact';

  const buttonClass = compact
    ? 'flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gray-900 px-2 py-2.5 sm:px-3 text-white transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900'
    : 'inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-gray-900 transition-all hover:scale-105 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
  const iconClass = compact ? 'h-6 w-6 shrink-0' : 'h-8 w-8';
  const smallTextClass = compact ? 'text-[10px] leading-tight text-gray-300' : 'text-xs text-gray-500';
  const bigTextClass = compact ? 'text-sm font-semibold leading-tight' : 'text-lg font-semibold';

  return (
    <div className={compact ? 'flex gap-3' : 'flex flex-col justify-center gap-4 sm:flex-row'}>
      <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <AppleIcon className={iconClass} />
        <div className="text-left">
          <p className={smallTextClass}>Download on the</p>
          <p className={bigTextClass}>App Store</p>
        </div>
      </a>
      <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <PlayIcon className={iconClass} />
        <div className="text-left">
          <p className={smallTextClass}>Get it on</p>
          <p className={bigTextClass}>Google Play</p>
        </div>
      </a>
    </div>
  );
}

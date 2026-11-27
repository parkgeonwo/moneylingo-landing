import type { ReactNode } from 'react';

/**
 * 랜딩 페이지 문구 (한국어 `/`, 일본어 `/ja`)
 * - 구성은 같고 문구·이미지·스토어 링크만 언어별로 다름
 * - 일본어는 원어민 검수 전 초안
 */
export type Locale = 'ko' | 'ja';

export interface LandingContent {
  locale: Locale;
  /** 언어 전환 토글에서 쓰는 홈 경로 */
  home: string;
  appName: string;
  logoAlt: string;
  nav: { features: string; faq: string; download: string; menuOpen: string };
  hero: { bgAlt: string; phoneAlt: string; phoneSrc: string; title: ReactNode; lead1: ReactNode; lead2: ReactNode };
  features: {
    badge: string;
    title: ReactNode;
    body: ReactNode;
    imageSrc: string;
    imageAlt: string;
  }[];
  character: {
    imageSrc: string;
    imageAlt: string;
    badge: string;
    rows: { label: string; value: ReactNode }[];
  };
  faq: { title: string; items: { question: string; answer: string }[] };
  cta: { mascotAlt: string; title: string; lead: string; body: ReactNode; note: string };
  footer: {
    tagline: string;
    info: { label: string; value: string; href?: string }[];
    links: { label: string; href: string }[];
  };
  store: { appStore: string; playStore: string };
}

const EMAIL = '82studio.xyz@gmail.com';

/** 강조 색 (한국어 원래 페이지와 같은 클래스) */
const Bold = ({ children }: { children: ReactNode }) => <span className="font-bold text-gray-900">{children}</span>;
const Green = ({ children }: { children: ReactNode }) => <span className="font-bold text-emerald-600">{children}</span>;
const Red = ({ children }: { children: ReactNode }) => <span className="font-bold text-red-500">{children}</span>;

export const ko: LandingContent = {
  locale: 'ko',
  home: '/',
  appName: '지갑교관',
  logoAlt: '지갑교관 로고',
  nav: { features: '기능', faq: 'FAQ', download: '앱 다운로드', menuOpen: '메뉴 열기' },
  hero: {
    bgAlt: '지갑교관 배경',
    phoneAlt: '지갑교관 앱 화면',
    phoneSrc: '/images/phone-mockup.png',
    title: (
      <>
        아직도 작심삼일
        <br />
        가계부입니까?
      </>
    ),
    lead1: (
      <>
        <span className="block sm:inline">기록하기 귀찮고, </span>
        <span className="block text-balance sm:inline">내가 얼마나 썼는지 감도 안 잡히는 소비 생활.</span>
      </>
    ),
    lead2: (
      <>
        <span className="block sm:inline">
          이제 <Bold>지갑교관</Bold>이{' '}
        </span>
        <span className="block text-balance sm:inline">당신의 소비 습관을 뜯어고쳐 드립니다.</span>
      </>
    ),
  },
  features: [
    {
      badge: '뼈 때리는 실시간 피드백',
      title: (
        <>
          &ldquo;돈 많습니까?
          <br />
          정신 차립니다.&rdquo;
        </>
      ),
      body: (
        <>
          소비를 입력하면, 지갑교관이 등판합니다.
          <br />
          <br />
          이번 달 예산과 현재 시간을 기준으로
          <br />
          <Green>칭찬</Green>하거나 <Red>호되게 혼냅니다.</Red>
        </>
      ),
      imageSrc: '/images/feedback.jpeg',
      imageAlt: '실시간 피드백 화면',
    },
    {
      badge: '눈에 보이는 남은 돈',
      title: (
        <>
          &ldquo;450,000원
          <br />
          남았습니다.&rdquo;
        </>
      ),
      body: (
        <>
          복잡한 계산은 교관이 합니다.
          <br />
          <br />
          <Bold>필수 소비</Bold>를 뺀
          <br />
          <Green>진짜 쓸 수 있는 돈</Green>만 보여줍니다.
        </>
      ),
      imageSrc: '/images/budget.png',
      imageAlt: '예산 화면',
    },
    {
      badge: '꺼지지 않는 기록의 불꽃',
      title: (
        <>
          &ldquo;오늘도 기록하셨군요!
          <br />
          123일째입니다.&rdquo;
        </>
      ),
      body: (
        <>
          기록하면 훈련 일수가 쌓이고
          <br />
          불꽃이 타오릅니다.
          <br />
          <br />
          기록을 멈추면
          <br />
          <Red>교관의 잔소리 폭격</Red>을 받게 됩니다.
        </>
      ),
      imageSrc: '/images/streak.png',
      imageAlt: '기록 스트릭 화면',
    },
  ],
  character: {
    imageSrc: '/images/character.png',
    imageAlt: '백억만 지갑교관',
    badge: '백억만 | 지갑교관',
    rows: [
      { label: '이름', value: '백억만 (지갑교관)' },
      {
        label: '성격',
        value: (
          <>
            까칠하지만
            <br />
            당신의 통장을 누구보다 걱정함.
          </>
        ),
      },
      {
        label: '특징',
        value: (
          <>
            잘하면 <span className="text-amber-500 font-bold">황금알</span>을 주지만,
            <br />
            과소비하면 <span className="text-red-500 font-bold">불호령</span>이 떨어짐.
          </>
        ),
      },
    ],
  },
  faq: {
    title: '자주 묻는 질문 (FAQ)',
    items: [
      {
        question: '필수 소비는 뭔가요?',
        answer: '월세, 통신비 등 숨만 쉬어도 나가는 고정 지출입니다. 이를 제외해야 진짜 용돈 관리가 됩니다.',
      },
      {
        question: '예산을 변경할 수 있나요?',
        answer: '네. 지정한 예산은 한 달간 유지되고, 변경한 예산은 다음 달 1일부터 적용됩니다.',
      },
    ],
  },
  cta: {
    mascotAlt: '지갑교관 백억만',
    title: '훈련병, 지금 바로 시작한다!',
    lead: '지갑을 지키는 가장 확실한 방법.',
    body: (
      <>
        망설이는 순간 통장은 <span className="text-red-400 font-bold">텅장</span>이 됩니다.
      </>
    ),
    note: '완전 무료',
  },
  footer: {
    tagline: '당신의 통장을 지키는 가장 확실한 훈련',
    info: [
      { label: '상호', value: '82스튜디오' },
      { label: '주소', value: '서울 서초구 강남대로83길 (반포동 732-18)' },
      { label: '대표자', value: '박건우' },
      { label: '사업자등록번호', value: '629-24-02028' },
      { label: '통신판매신고번호', value: '2025-서울서초-3296' },
      { label: '개인정보관리책임자', value: '박건우' },
      { label: '고객센터', value: EMAIL, href: `mailto:${EMAIL}` },
      { label: '전화', value: '010-9474-3580', href: 'tel:010-9474-3580' },
    ],
    links: [
      { label: '기능', href: '#features' },
      { label: 'FAQ', href: '#faq' },
      { label: '다운로드', href: '#download' },
      { label: '개인정보 처리방침', href: '/privacy' },
    ],
  },
  store: {
    appStore: 'https://apps.apple.com/kr/app/%EC%A7%80%EA%B0%91%EA%B5%90%EA%B4%80/id6756384444',
    playStore: 'https://play.google.com/store/apps/details?id=io.github.parkgeonwo.moneylingo&pcampaignid=web_share',
  },
};

export const ja: LandingContent = {
  locale: 'ja',
  home: '/ja',
  appName: '財布教官',
  logoAlt: '財布教官 ロゴ',
  nav: { features: '機能', faq: 'FAQ', download: 'アプリをダウンロード', menuOpen: 'メニューを開く' },
  hero: {
    bgAlt: '財布教官 背景',
    phoneAlt: '財布教官 アプリ画面',
    phoneSrc: '/images/ja/phone-mockup.png',
    title: (
      <>
        まだ三日坊主の
        <br />
        家計簿ですか？
      </>
    ),
    lead1: (
      <>
        <span className="block sm:inline">記録はめんどくさいし、</span>
        <span className="block text-balance sm:inline">いくら使ったかもよくわからない毎日。</span>
      </>
    ),
    lead2: (
      <>
        <span className="block sm:inline">
          これからは<Bold>財布教官</Bold>が
        </span>
        <span className="block text-balance sm:inline">あなたの浪費グセを叩き直します。</span>
      </>
    ),
  },
  features: [
    {
      badge: '容赦ないリアルタイムツッコミ',
      title: (
        <>
          &ldquo;金持ちか？
          <br />
          目を覚ませ。&rdquo;
        </>
      ),
      body: (
        <>
          支出を記録すると、財布教官が登場。
          <br />
          <br />
          今月の予算と今の時間をもとに
          <br />
          <Green>ほめる</Green>か、<Red>容赦なく叱ります。</Red>
        </>
      ),
      imageSrc: '/images/ja/feedback.png',
      imageAlt: 'リアルタイムツッコミ画面',
    },
    {
      badge: 'ひと目でわかる残りのお金',
      title: (
        <>
          &ldquo;残り45,000円
          <br />
          であります。&rdquo;
        </>
      ),
      body: (
        <>
          面倒な計算は教官がやります。
          <br />
          <br />
          <Bold>必須の支出</Bold>を引いた
          <br />
          <Green>本当に使えるお金</Green>だけを表示します。
        </>
      ),
      imageSrc: '/images/ja/budget.png',
      imageAlt: '予算画面',
    },
    {
      badge: '燃え続ける記録の炎',
      title: (
        <>
          &ldquo;今日も記録完了！
          <br />
          123日目です。&rdquo;
        </>
      ),
      body: (
        <>
          記録するたびに訓練日数が増えて
          <br />
          炎が燃え上がります。
          <br />
          <br />
          記録をサボると
          <br />
          <Red>教官の小言の嵐</Red>が待っています。
        </>
      ),
      imageSrc: '/images/ja/streak.png',
      imageAlt: '連続記録画面',
    },
  ],
  character: {
    imageSrc: '/images/ja/character.png',
    imageAlt: '財布教官 百億万',
    badge: '百億万 | 財布教官',
    rows: [
      { label: '名前', value: '百億万（財布教官）' },
      {
        label: '性格',
        value: (
          <>
            口は悪いけど、
            <br />
            あなたの口座を誰よりも心配している。
          </>
        ),
      },
      {
        label: '特徴',
        value: (
          <>
            ほめるのは<span className="text-amber-500 font-bold">ごくたまに</span>。
            <br />
            使いすぎたら<span className="text-red-500 font-bold">雷が落ちる</span>。
          </>
        ),
      },
    ],
  },
  faq: {
    title: 'よくある質問（FAQ）',
    items: [
      {
        question: '「必須の支出」って何ですか？',
        answer: '家賃や通信費など、息をしているだけで出ていく固定費のことです。これを引いてこそ、本当に使えるお金が見えてきます。',
      },
      {
        question: '予算は変更できますか？',
        answer: 'はい。設定した予算は1か月間そのまま使われ、変更した予算は翌月から適用されます。',
      },
    ],
  },
  cta: {
    mascotAlt: '財布教官 百億万',
    title: '訓練兵、今すぐ始めるぞ！',
    lead: '財布を守る、いちばん確実な方法。',
    body: (
      <>
        迷っているうちに、口座は<span className="text-red-400 font-bold">すっからかん</span>になる。
      </>
    ),
    note: '無料で使えます',
  },
  footer: {
    tagline: 'あなたの口座を守る、いちばん確実な訓練',
    info: [
      { label: '運営', value: '82スタジオ（82studio）' },
      { label: 'お問い合わせ', value: EMAIL, href: `mailto:${EMAIL}` },
    ],
    links: [
      { label: '機能', href: '#features' },
      { label: 'FAQ', href: '#faq' },
      { label: 'ダウンロード', href: '#download' },
      { label: 'プライバシーポリシー', href: '/ja/privacy' },
      { label: '利用規約', href: '/ja/terms' },
    ],
  },
  store: {
    appStore: 'https://apps.apple.com/jp/app/id6756384444',
    playStore: 'https://play.google.com/store/apps/details?id=io.github.parkgeonwo.moneylingo&hl=ja',
  },
};

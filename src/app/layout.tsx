import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "지갑교관 - 당신의 통장을 지키는 가장 확실한 훈련",
  description: "작심삼일 가계부는 이제 그만! 지갑교관이 당신의 소비 습관을 뜯어고쳐 드립니다. 실시간 피드백과 절약 훈련으로 건강한 소비 습관을 만들어요.",
  keywords: ["가계부", "소비습관", "절약", "재테크", "돈관리", "지출관리", "예산관리", "지갑교관", "백억만"],
  openGraph: {
    title: "지갑교관 - 당신의 통장을 지키는 가장 확실한 훈련",
    description: "작심삼일 가계부는 이제 그만! 지갑교관이 당신의 소비 습관을 뜯어고쳐 드립니다.",
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "지갑교관 - 당신의 통장을 지키는 가장 확실한 훈련",
    description: "작심삼일 가계부는 이제 그만! 지갑교관이 당신의 소비 습관을 뜯어고쳐 드립니다.",
  },
};

/** 아이폰 홈 인디케이터 영역까지 그려야 하단 고정 바의 safe-area 여백이 동작함 */
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

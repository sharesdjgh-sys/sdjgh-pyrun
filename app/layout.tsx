import type { Metadata } from "next";
import { Jua, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";
import PwaRegister from "@/components/PwaRegister";
import MobileWarningModal from "@/components/MobileWarningModal";

const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jua",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PyRun Studio",
  description: "코딩하면 캐릭터가 반응하는 실습형 파이썬",
  manifest: "/manifest.json",
  icons: {
    icon: "/pyrun_studio-favicon.png",
    apple: "/pyrun_studio-favicon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PyRun Studio",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body
        className={`${jua.variable} ${jetbrainsMono.variable}`}
        style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}
      >
        <SessionProvider session={session}>
          {children}
          <PwaRegister />
          <MobileWarningModal />
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { TransitionProvider } from "@/context/TransitionContext";
import { LensTransitionOverlay, PageContentWrapper } from "@/components/LensTransitionOverlay";

export const metadata: Metadata = {
  title: "RecLens — Evidence-First AI RFP Intelligence & Proposal Engineering",
  description: "Read. Reason. Verify. Propose. From complex RFPs to defensible, audit-backed proposals in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#080807] text-[#f4f2ec] font-sans antialiased selection:bg-[#b08d4b]/30 selection:text-white">
        <TransitionProvider>
          <LensTransitionOverlay />
          <PageContentWrapper>{children}</PageContentWrapper>
        </TransitionProvider>
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { ClientShell } from "@/components/ClientShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monad Alpha — Smart On-Chain Intelligence",
  description:
    "Real-time on-chain intelligence, smart money tracking, and AI synthesis for the Monad ecosystem.",
  keywords: ["Monad", "Web3", "Crypto Alpha", "Smart Money", "DEX Radar", "On-chain Intelligence"],
  icons: {
    icon: "/monad-logo.svg",
    shortcut: "/monad-logo.svg",
    apple: "/monad-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-screen bg-[#060709] text-[#E2E8F0] font-sans selection:bg-[#7053F5]/30 selection:text-white flex flex-col">
        <WalletProvider>
          <ClientShell>{children}</ClientShell>
        </WalletProvider>
      </body>
    </html>
  );
}

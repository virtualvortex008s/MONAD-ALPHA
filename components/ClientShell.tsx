"use client";

import React, { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { SearchModal } from "./SearchModal";
import { FloatingHandbook } from "./FloatingHandbook";
import { mockTokens } from "@/data/mockTokens";
import { Token } from "@/types/token";

export const ClientShell: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectToken = (token: Token) => {
    router.push(`/token/${token.address}`);
  };

  const isLandingPage = pathname === "/landing";

  if (isLandingPage) {
    return (
      <div className="flex min-h-screen flex-col bg-[#060709] text-[#E2E8F0]">
        <main className="flex-1">{children}</main>
        <Footer />
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          tokens={mockTokens}
          onSelectToken={handleSelectToken}
        />
        <FloatingHandbook />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#060709] text-[#E2E8F0]">
      {/* Persistent Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area with Sticky TopBar */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
        <Footer />
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        tokens={mockTokens}
        onSelectToken={handleSelectToken}
      />
      <FloatingHandbook />
    </div>
  );
};

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        monad: {
          DEFAULT: "#7053F5",
          600: "#7053F5",
          hover: "#5E3FEB",
          900: "#2B1A6B",
          bg: "#060709",
          card: "#0D0F14",
          cardHover: "#13161F",
          border: "#171922",
          terminal: "#0A0C11",
          purple: {
            DEFAULT: "#7053F5",
            button: "#7053F5",
            hover: "#5E3FEB",
            glow: "rgba(112, 83, 245, 0.25)",
            subtle: "rgba(112, 83, 245, 0.12)",
          },
          mint: {
            DEFAULT: "#00FFA3",
            glow: "rgba(0, 255, 163, 0.25)",
            subtle: "rgba(0, 255, 163, 0.12)",
          },
          emerald: {
            DEFAULT: "#00FFA3",
            glow: "rgba(0, 255, 163, 0.25)",
            subtle: "rgba(0, 255, 163, 0.12)",
          },
          amber: {
            DEFAULT: "#F59E0B",
            glow: "rgba(245, 158, 11, 0.25)",
            subtle: "rgba(245, 158, 11, 0.12)",
          },
          red: {
            DEFAULT: "#EF4444",
            glow: "rgba(239, 68, 68, 0.25)",
            subtle: "rgba(239, 68, 68, 0.12)",
          },
          text: {
            primary: "#FFFFFF",
            secondary: "#8B909D",
            muted: "#525866",
          },
        },
        "dark-bg": "#060709",
        "dark-card": "#0D0F14",
        "dark-hover": "#13161F",
        "dark-border": "#171922",
        "terminal-bg": "#0A0C11",
        "neon-mint": "#00FFA3",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "SF Mono", "monospace"],
      },
      boxShadow: {
        "glow-purple": "0 0 25px -3px rgba(131, 110, 249, 0.35)",
        "glow-green": "0 0 25px -3px rgba(0, 255, 163, 0.35)",
        "glow-card": "0 8px 32px 0 rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "marquee": "marquee 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

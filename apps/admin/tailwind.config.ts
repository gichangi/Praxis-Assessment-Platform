import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "text-main": "rgb(var(--color-ink) / <alpha-value>)",
        stone: "rgb(var(--color-stone) / <alpha-value>)",
        action: "rgb(var(--color-action) / <alpha-value>)",
        "action-ink": "rgb(var(--color-action-ink) / <alpha-value>)",
        "action-hover": "rgb(var(--color-action-hover) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--color-primary) / <alpha-value>)",
          50: "rgb(var(--color-primary-50) / <alpha-value>)",
          100: "rgb(var(--color-primary-100) / <alpha-value>)",
          500: "rgb(var(--color-primary) / <alpha-value>)",
          600: "rgb(var(--color-primary-600) / <alpha-value>)",
          700: "rgb(var(--color-primary-700) / <alpha-value>)",
        },
        logistics: {
          DEFAULT: "#9C5416",
          50: "#FDF3EA",
          500: "#9C5416",
          600: "#7E4411",
        },
        border: "rgb(var(--color-border) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "IBM Plex Sans", "system-ui", "sans-serif"],
        serif: ["var(--font-ibm-plex-serif)", "IBM Plex Serif", "Georgia", "serif"],
      },
      borderRadius: {
        card: "6px",
        DEFAULT: "4px",
      },
    },
  },
  plugins: [],
};

export default config;

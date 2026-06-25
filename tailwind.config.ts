import type { Config } from "tailwindcss";

/**
 * High-contrast, large-touch-target "chalkboard" aesthetic for sweaty hands and
 * a propped gym display. Dark by default.
 */
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Readiness tiers — used across the runner + home card.
        tier: {
          green: "#22c55e",
          amber: "#f59e0b",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Oversized type for the timer / current movement, legible across a gym.
        timer: ["clamp(4rem, 18vw, 12rem)", { lineHeight: "1" }],
        "board-xl": ["clamp(2rem, 6vw, 4.5rem)", { lineHeight: "1.05" }],
      },
    },
  },
  plugins: [],
};

export default config;

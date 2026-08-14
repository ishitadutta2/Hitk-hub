import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF7EF",
        ink: "#1C2541",
        indigo: {
          DEFAULT: "#3A5A99",
          dark: "#233A66",
        },
        gold: "#D4A24C",
        sage: "#6B8F71",
        rose: "#C4626B",
        card: "#FFFFFF",
      },
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(28,37,65,0.06) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a1a1f",
          900: "#0c2229",
          800: "#123039",
        },
        brand: {
          50: "#eefaf8",
          100: "#d3f2ec",
          200: "#a8e4da",
          300: "#72d0c1",
          400: "#3fb5a4",
          500: "#23968a",
          600: "#19766f",
          700: "#175f5b",
          800: "#164c4a",
          900: "#153f3e",
        },
        canvas: "#eef6f5",
        sand: "#f7f5ef",
      },
      fontFamily: {
        display: [
          '"Plus Jakarta Sans"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        body: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(12, 34, 41, 0.04), 0 8px 24px -12px rgba(12, 34, 41, 0.12)",
        panel: "0 1px 3px rgba(12, 34, 41, 0.06), 0 20px 40px -24px rgba(12, 34, 41, 0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;

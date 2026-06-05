import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8F1",
        paper: "#FFFDF8",
        peach: "#FFD8C2",
        coral: "#F28C82",
        blush: "#F8B7C4",
        clay: "#B9715C",
        sand: "#E9D6B8",
        mint: "#BFE6D0",
        sky: "#B9DDF2",
        lavender: "#D8C8F2",
        ink: "#3D302B"
      },
      boxShadow: {
        soft: "0 18px 55px rgba(185, 113, 92, 0.14)"
      }
    }
  },
  plugins: []
};

export default config;

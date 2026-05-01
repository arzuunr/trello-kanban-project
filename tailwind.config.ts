import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: "#050505",
          dark: "#0d0d0d",
          neonPurple: "#bc13fe",
          neonBlue: "#0ff0fc",
          neonRed: "#ff073a",
          border: "#1f1f1f"
        }
      },
      boxShadow: {
        'neon-blue': '0 0 10px #0ff0fc, 0 0 20px #0ff0fc',
        'neon-purple': '0 0 10px #bc13fe, 0 0 20px #bc13fe',
      }
    }
  },
  plugins: [],
};
export default config;

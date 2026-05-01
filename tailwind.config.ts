import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Akademik başlıklar için Serif (Tırnaklı) font
        serif: ['var(--font-lora)', 'serif'],
        // Temiz metinler için Sans font
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // MIT Kırmızısı veya Koyu Antrasit tonları
        academic: {
          light: "#fcfcfc", // Kağıt beyazı
          gray: "#f4f4f4",  // Arka plan grisi
          dark: "#1a1a1a",  // Ana metin rengi
          accent: "#A31F34", // MIT kırmızısı (vurgu için)
        }
      }
    },
  },
  plugins: [],
};
export default config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: "#030303",
          surface: "#0a0a0a",
          border: "#1a1a1a",
          neonBlue: "#00f3ff",
          neonPurple: "#9d00ff",
          textMain: "#e0e0e0",
        }
      }
    }
  },
  plugins: [],
}

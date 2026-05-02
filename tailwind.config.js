/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#06040f",
        surface: "#0e0a1a",
        panel: "#130f22",
        border: "#2a1f45",
        accent: "#c084fc",
        accentPink: "#f472b6",
        accentBlue: "#818cf8",
        textMain: "#f1eeff",
        textDim: "#9985c8",
        muted: "#4a3a6a",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#ffffff",
        card: "#111113",
        "card-border": "#1e1e21",
        primary: {
          DEFAULT: "#10b981",
          dark: "#059669",
        },
        accent: "#f59e0b",
        danger: "#f43f5e",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      animation: {
        "slide-up": "slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

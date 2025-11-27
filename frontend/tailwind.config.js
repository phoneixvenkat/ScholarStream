/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#1e3a8a", // deep blue
        accent: "#0ea5e9"
      },
      boxShadow: {
        card: "0 10px 25px rgba(15, 23, 42, 0.12)"
      }
    }
  },
  plugins: []
};

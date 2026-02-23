/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./context/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        smartBlue: "#0f5fff",
        smartTeal: "#00b3a4",
        smartInk: "#0f172a"
      },
      boxShadow: {
        glass: "0 10px 35px rgba(10, 20, 40, 0.18)"
      }
    }
  },
  plugins: []
};

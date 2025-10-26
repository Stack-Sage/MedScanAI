/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./pages/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fdfcf7",
          100: "#f7f3e8",
        },
      },
    },
  },
  plugins: [],
}

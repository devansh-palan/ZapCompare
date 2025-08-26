/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",               // if you have index.html in root
    "./src/**/*.{js,jsx,ts,tsx}", // scan all React files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

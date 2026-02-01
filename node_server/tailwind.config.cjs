/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../frontend/**/*.html',
    '../frontend/**/*.js'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8b0000',
        darkRed: '#660000'
      }
    }
  },
  plugins: []
}

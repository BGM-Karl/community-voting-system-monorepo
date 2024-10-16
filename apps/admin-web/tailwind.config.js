/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: '600px',
      md: '1024px',
      lg: '1440px',
      xl: '1920px',
    }
  },
  plugins: [],
}

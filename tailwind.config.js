/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Pixelify-Sans"', 'ui-sans-serif', 'system-ui'],
        // You can also create a specific name:
        // main: ['MyCustomFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

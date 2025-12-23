/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 3. Register it in Tailwind to use 'font-main' or override 'sans'
      fontFamily: {
        sans: ['"Pixelify-Sans"', 'ui-sans-serif', 'system-ui'],
        // You can also create a specific name:
        // main: ['MyCustomFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

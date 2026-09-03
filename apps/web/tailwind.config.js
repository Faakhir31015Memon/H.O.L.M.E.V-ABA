/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          cyan: '#00f3ff',
          blue: '#0066ff',
          dark: '#050b14',
          panel: '#0a1526',
          border: '#1e3a5f',
          glow: 'rgba(0, 243, 255, 0.2)'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}

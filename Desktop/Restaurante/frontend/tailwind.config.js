/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3498db',
          dark: '#2980b9',
        },
        secondary: '#2c3e50',
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        background: {
          light: '#ecf0f1',
          white: '#ffffff',
        },
        text: {
          dark: '#2c3e50',
          medium: '#34495e',
          light: '#7f8c8d',
        }
      },
    },
  },
  plugins: [],
}

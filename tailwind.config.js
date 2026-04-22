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
          DEFAULT: '#6C63FF',
          light: '#F0EFFE',
        },
        page: '#F5F6FA',
        card: '#FFFFFF',
        border: '#E8E8E8',
        'status-active': {
          bg: '#E8F5E9',
          text: '#2E7D32',
          border: '#A5D6A7',
        },
        'status-expired': {
          bg: '#FFEBEE',
          text: '#C62828',
          border: '#EF9A9A',
        },
        'status-warning': {
          bg: '#FFF8E1',
          text: '#F57F17',
          border: '#FFE082',
        },
        'status-inactive': {
          bg: '#F5F5F5',
          text: '#616161',
          border: '#E0E0E0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'nav': '13px',
        'stat': '28px',
        'table-header': '12px',
        'table-cell': '13px',
      },
    },
  },
  plugins: [],
}

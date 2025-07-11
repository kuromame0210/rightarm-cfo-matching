/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      zIndex: {
        'modal': '1000',
        'dropdown': '100',
        'header': '50',
        'notification': '9999',
      }
    },
  },
  plugins: [],
}
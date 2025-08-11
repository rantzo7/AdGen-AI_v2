/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode based on the 'dark' class
  theme: {
    extend: {
      colors: {
        'primary-brand': '#2563EB',
        'background': '#F8FAFC',
        'container': '#FFFFFF',
        'primary-text': '#1E293B',
        'secondary-text': '#64748B',
        'success-green': '#10B981',
        'error-red': '#EF4444',
        'input-background': '#F1F5F9',
        'sidebar-background': '#FFFFFF',
        'sidebar-text': '#1E293B',
        'sidebar-hover': '#E2E8F0',
        'icon-color': '#64748B',
      },
    },
  },
  plugins: [],
}

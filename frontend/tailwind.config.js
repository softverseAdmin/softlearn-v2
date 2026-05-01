/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sl-bg': '#f9fafb',
        'sl-surface': '#ffffff',
        'sl-primary': '#6366f1',
        'sl-soft': '#eef2ff',
        'sl-text': '#111827',
        'sl-muted': '#6b7280',
        'sl-border': '#e5e7eb',
        'sl-success': '#16a34a',
        'sl-warning': '#f59e0b',
        'sl-danger': '#dc2626',
      },
    },
  },
  plugins: [],
  // Optimize for production
  safelist: [],
  // Purge unused styles in production
  purge: {
    enabled: true,
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
  },
}

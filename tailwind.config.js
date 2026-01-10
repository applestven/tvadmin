/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1677ff',
        success: '#52c41a',
        warning: '#faad14',
        error: '#ff4d4f',
      },
    },
  },
  plugins: [],
  // 注意：不再禁用 preflight，而是通过 CSS 覆盖来解决冲突
}

/** @type {import('tailwindcss').Config} */
export default {
  mode: "jit",
  content: [
    "./assets/**/*.css",
        "./components/*.{vue,js}",
        "./components/**/*.{vue,js}",
        "./pages/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./App.{js,ts,vue}",
        "./app.{js,ts,vue}", 
        "./Error.{js,ts,vue}", 
        "./error.{js,ts,vue}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui')
  ],
}


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#04060b",
        },
      },
      boxShadow: {
        glow: "0 55px 170px -120px rgba(59,130,246,1)",
      },
    },
  },
  plugins: [],
};

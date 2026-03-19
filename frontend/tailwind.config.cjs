/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bydBlue: "#082C8D",
        bydDarkBlue: "#020C3A",
        bydLightBlue: "#E5ECFF",
        bydGray: "#F5F7FB"
      },
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 30px rgba(10, 32, 88, 0.15)"
      }
    }
  },
  plugins: []
};


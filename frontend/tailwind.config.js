/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        white: "#ffffff",
        black: "#000000",
        "very-light-pinki": "#c7c7c7",
        "text-input-field": "#f7f7f7",
        "hospital-green": "#acd982",
      },
      fontFamily: {
        quicksand: ["Quicksand", "sans-serif"],
      },
      fontSize: {
        sm: "14px",
        md: "16px",
        lg: "18px",
      },
    },
  },
  plugins: [],
};

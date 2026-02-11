module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "#0a0f1a",
          800: "#111827",
          700: "#1f2937",
          600: "#273449",
          500: "#334155"
        },
        aqua: {
          500: "#2dd4bf",
          400: "#5eead4"
        },
        sunrise: {
          500: "#f97316",
          400: "#fb923c"
        }
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui"],
        display: ["Fraunces", "serif"]
      },
      boxShadow: {
        glow: "0 20px 60px rgba(45, 212, 191, 0.15)",
        card: "0 24px 60px rgba(15, 23, 42, 0.45)"
      }
    }
  },
  plugins: []
};

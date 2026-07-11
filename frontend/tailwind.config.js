/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#050705",
        "surface-dim": "#020302",
        "surface-container-lowest": "#000000",
        "surface-container-low": "#050805",
        "surface-container": "#0B100B",
        "surface-container-high": "#101810",
        "surface-container-highest": "#182418",
        primary: "#39FF14",
        "primary-container": "#003B00",
        "on-primary": "#000000",
        "on-primary-container": "#39FF14",
        secondary: "#00FF00",
        "secondary-container": "#002200",
        "on-secondary-container": "#00FF00",
        tertiary: "#00D600",
        "tertiary-container": "#004B00",
        outline: "#005500",
        "outline-variant": "#002A00",
        error: "#FF3333",
        "error-container": "#4A0000",
        "on-error": "#000000",
        "on-surface": "#39FF14",
        "on-surface-variant": "#00BB00",
        success: "#39FF14",
        warning: "#FFFF00"
      },
      borderRadius: {
        DEFAULT: "0px",
        lg: "0px",
        xl: "0px",
        full: "9999px"
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        margin: "24px"
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        geist: ["Geist", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 20px rgba(99,102,241,0.3)",
        "soft-purple": "0 16px 50px rgba(87,27,193,0.18)"
      }
    }
  },
  plugins: []
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0B",
        surface: "#131314",
        "surface-dim": "#131314",
        "surface-container-lowest": "#0e0e0f",
        "surface-container-low": "#1c1b1c",
        "surface-container": "#201f20",
        "surface-container-high": "#2a2a2b",
        "surface-container-highest": "#353436",
        primary: "#c0c1ff",
        "primary-container": "#8083ff",
        "on-primary": "#1000a9",
        "on-primary-container": "#0d0096",
        secondary: "#d0bcff",
        "secondary-container": "#571bc1",
        "on-secondary-container": "#c4abff",
        tertiary: "#d3bbff",
        "tertiary-container": "#a476ff",
        outline: "#908fa0",
        "outline-variant": "#464554",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-surface": "#e5e2e3",
        "on-surface-variant": "#c7c4d7",
        success: "#22c55e",
        warning: "#f59e0b"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem"
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

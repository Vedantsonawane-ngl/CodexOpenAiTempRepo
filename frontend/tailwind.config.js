/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#080B10",
        surface: "#0F141C",
        "surface-dim": "#0C1017",
        "surface-container-lowest": "#06090D",
        "surface-container-low": "#0F141C",
        "surface-container": "#151B26",
        "surface-container-high": "#1C2433",
        "surface-container-highest": "#242E40",
        primary: "#3B82F6",
        "primary-container": "#1D4ED8",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#EFF6FF",
        secondary: "#64748B",
        "secondary-container": "#1E293B",
        "on-secondary-container": "#F1F5F9",
        tertiary: "#0D9488",
        "tertiary-container": "#115E59",
        outline: "#334155",
        "outline-variant": "#1E293B",
        error: "#EF4444",
        "error-container": "#7F1D1D",
        "on-error": "#FFFFFF",
        "on-surface": "#F8FAFC",
        "on-surface-variant": "#94A3B8",
        success: "#10B981",
        warning: "#F59E0B"
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.375rem",
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

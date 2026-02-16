import { platformSelect } from "nativewind/theme";
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#1ea853",
          700: "#16a34a",
          800: "#15803d",
          900: "#166534",
        },
        accent: {
          green: "#2ECC71",
          "light-green": "#A8E6C1",
          "pale-green": "#E8F5E9",
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#666666",
          light: "#999999",
        },
        background: {
          light: "#F8F9FA",
          white: "#FFFFFF",
        },
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "43px" }],
      },
      fontFamily: {
        example: ["ExampleFontFamily"],
        sans: ["manrope", "Manrope", "system-ui", "sans-serif"],
        system: platformSelect({
          ios: "manrope",
          android: "manrope",
          default: "manrope",
        }),
      },
      borderRadius: {
        none: "0",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        full: "9999px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
      },
    },
  },
  plugins: [],
};

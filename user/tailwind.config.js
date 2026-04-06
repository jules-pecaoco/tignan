/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#111110",
        auth: "#0A0A09",
        card: "#1A1A18",
        border: "#2C2C2A",
        primary: "#F1EFE8",
        muted: "#888780",
        accent: "#E24B4A",
        success: "#639922",
        warning: "#EF9F27",
      },
    },
  },
  plugins: [],
}

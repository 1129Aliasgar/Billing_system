import type { Config } from "tailwindcss"
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0ea5e9",
        accent: "#10b981",
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
} satisfies Config

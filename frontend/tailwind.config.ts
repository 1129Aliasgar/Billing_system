import type { Config } from "tailwindcss"
export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Blue-shade based theme palette
        primary: {
          DEFAULT: "#579BB1",
          dark: "#4A8A9E",
          light: "#6BA8BC",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E1D7C6",
          foreground: "#1F2937",
        },
        accent: {
          DEFAULT: "#ECE8DD",
          foreground: "#1F2937",
        },
        background: "#F8F4EA",
        foreground: "#1F2937",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#579BB1",
        muted: {
          DEFAULT: "#F3F4F6",
          foreground: "#6B7280",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
} satisfies Config

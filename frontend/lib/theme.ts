/**
 * Centralized Theme Configuration
 * Blue-shade based color palette for B2B professionalism
 */

export const theme = {
  colors: {
    primary: "#579BB1",      // Primary blue shade
    secondary: "#E1D7C6",    // Warm beige
    accent: "#ECE8DD",        // Light cream
    background: "#F8F4EA",    // Soft off-white
    // Semantic colors derived from primary
    primaryDark: "#4A8A9E",   // Darker shade for hover states
    primaryLight: "#6BA8BC",  // Lighter shade for active states
  },
  typography: {
    fontFamily: {
      sans: "var(--font-geist-sans)",
      mono: "var(--font-geist-mono)",
    },
  },
  spacing: {
    section: "2rem",
    card: "1.5rem",
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
} as const

export type Theme = typeof theme


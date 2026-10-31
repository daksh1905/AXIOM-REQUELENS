/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        charcoal: {
          950: "#080807",
          900: "#0f0f0c",
          850: "#161612",
          800: "#20201a",
          750: "#2a2922",
          700: "#36342b",
          600: "#4b483c",
        },
        stone: {
          50: "#faf9f6",
          100: "#f4f1ea",
          200: "#e7e2d6",
          300: "#d3c9b7",
          400: "#b3a78f",
          500: "#9e8973",
          600: "#8a725c",
          700: "#695f4f",
          800: "#473924",
          900: "#2b2316",
        },
        bronze: {
          300: "#e0c79b",
          400: "#cda76e",
          500: "#b08d4b",
          600: "#8f6f36",
          700: "#6e5325",
        },
        navy: {
          950: "#090d16",
          900: "#0e1626",
          850: "#131d33",
          800: "#192642",
          700: "#24355c",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        grounded: "#10b981",    // Green for RFP-grounded
        proposed: "#3b82f6",    // Blue for proposed solution
        assumption: "#f59e0b",  // Yellow for assumption
        unsupported: "#ef4444", // Red for unsupported claim
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        editorial: ["'Cormorant Garamond'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
}


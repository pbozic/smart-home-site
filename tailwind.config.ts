import type { Config } from "tailwindcss";

/**
 * Design tokens for the giga-modern smart-home site.
 * Colors are also mirrored as CSS variables in globals.css so they can be
 * themed at runtime; Tailwind reads them here for utility classes.
 */
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "./sanity/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces (dark, layered)
        ink: {
          950: "#070a12",
          900: "#0b1020",
          800: "#121829",
          700: "#1b2238",
          600: "#28304a",
        },
        // Brand accent — electric cyan/teal (smart, techy, fresh)
        brand: {
          50: "#e6fbff",
          100: "#c0f4ff",
          200: "#86e9ff",
          300: "#3dd6f5",
          400: "#16bfe0",
          500: "#06a3c4",
          600: "#0883a1",
          700: "#0d6880",
          800: "#13556a",
          900: "#14475a",
        },
        // Secondary accent — violet for gradients/highlights
        accent: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        mist: {
          100: "#eef2f8",
          200: "#cdd6e6",
          300: "#9fadc6",
          400: "#6b7a96",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(61,214,245,0.18), 0 20px 60px -20px rgba(6,163,196,0.45)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 50px -25px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-brand":
          "radial-gradient(60% 60% at 50% 0%, rgba(61,214,245,0.18) 0%, rgba(124,58,237,0.10) 40%, transparent 70%)",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

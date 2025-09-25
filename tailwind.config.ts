import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        heading: ["var(--font-heading)", ...fontFamily.sans],
        mono: ["var(--font-mono)", ...fontFamily.mono],
      },
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
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Portfolio-specific colors
        skill: {
          beginner: "hsl(var(--skill-beginner))",
          intermediate: "hsl(var(--skill-intermediate))",
          advanced: "hsl(var(--skill-advanced))",
          expert: "hsl(var(--skill-expert))",
        },
        // Blog-specific colors
        blog: {
          tag: "hsl(var(--blog-tag))",
          category: "hsl(var(--blog-category))",
          highlight: "hsl(var(--blog-highlight))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        // Modern background animations
        "subtle-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(1px, -1px) scale(1.001)" },
          "66%": { transform: "translate(-1px, 1px) scale(0.999)" },
        },
        "gradient-float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(20px, -10px) scale(1.1)" },
          "66%": { transform: "translate(-15px, 15px) scale(0.9)" },
        },
        "gradient-float-delayed": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-25px, 20px) scale(0.95)" },
          "66%": { transform: "translate(18px, -18px) scale(1.05)" },
        },
        "gradient-float-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(10px, -25px) scale(1.02)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-in",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-from-right": "slide-in-from-right 0.3s ease-out",
        "slide-in-from-left": "slide-in-from-left 0.3s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        // Modern background animations
        "subtle-float": "subtle-float 20s ease-in-out infinite",
        "gradient-float": "gradient-float 15s ease-in-out infinite",
        "gradient-float-delayed": "gradient-float-delayed 18s ease-in-out infinite 3s",
        "gradient-float-slow": "gradient-float-slow 25s ease-in-out infinite 8s",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "65ch",
            a: {
              color: "hsl(var(--primary))",
              textDecoration: "none",
              fontWeight: "500",
              "&:hover": {
                textDecoration: "underline",
              },
            },
            blockquote: {
              borderLeftColor: "hsl(var(--primary))",
              backgroundColor: "hsl(var(--muted))",
              fontStyle: "normal",
            },
            code: {
              backgroundColor: "hsl(var(--muted))",
              borderRadius: "0.25rem",
              padding: "0.15rem 0.3rem",
              fontWeight: "400",
            },
            pre: {
              backgroundColor: "hsl(var(--card))",
              borderRadius: "var(--radius)",
              border: "1px solid hsl(var(--border))",
            },
          },
        },
      },
      // Enhanced background patterns for modern aesthetic
      backgroundImage: {
        "dot-pattern":
          "radial-gradient(circle, currentColor 1px, transparent 1px)",
        "grid-pattern":
          "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
        "modern-dots":
          "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
        "tech-grid":
          "linear-gradient(currentColor 0.5px, transparent 0.5px), linear-gradient(90deg, currentColor 0.5px, transparent 0.5px)",
        "diamond-pattern":
          "radial-gradient(circle at 0.5px 0.5px, currentColor 0.5px, transparent 0.5px), radial-gradient(circle at 12.5px 12.5px, currentColor 0.5px, transparent 0.5px)",
        "wave-pattern":
          "radial-gradient(ellipse 100% 20px at 50% 0%, currentColor, transparent), radial-gradient(ellipse 100% 20px at 50% 100%, currentColor, transparent)",
      },
      backgroundSize: {
        "dot-sm": "20px 20px",
        "dot-md": "30px 30px",
        "dot-lg": "40px 40px",
        "grid-sm": "20px 20px",
        "grid-md": "30px 30px",
        "grid-lg": "40px 40px",
        "modern-sm": "24px 24px",
        "modern-md": "32px 32px",
        "modern-lg": "48px 48px",
        "tech-sm": "16px 16px",
        "tech-md": "24px 24px",
        "tech-lg": "32px 32px",
        "diamond-sm": "20px 20px",
        "diamond-md": "25px 25px",
        "diamond-lg": "30px 30px",
        "wave-sm": "60px 30px",
        "wave-md": "80px 40px",
        "wave-lg": "100px 50px",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms")({
      strategy: "class", // only generate classes
    }),
  ],
};

export default config;

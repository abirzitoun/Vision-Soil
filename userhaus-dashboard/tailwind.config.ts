export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#6D8E3E", // ✅ Couleur verte extraite de ton image
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#9AD0C2",
          foreground: "#1a1a1a",
        },
        soil: {
          DEFAULT: "#6D8E3E", // ✅ Nouvelle couleur dominante
          50: "#f2f6eb",
          100: "#e4ecd6",
          200: "#c3d8ac",
          300: "#a2c482",
          400: "#81b058",
          500: "#6D8E3E", // ✅ Couleur principale
          600: "#4f6a2f",
          700: "#384d23",
          800: "#222f16",
          900: "#0b1209",
        },
        success: {
          DEFAULT: "#4BB543",
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#FFA500",
          foreground: "#ffffff",
        },
        error: {
          DEFAULT: "#FF0033",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.1)",
          foreground: "hsl(var(--foreground))",
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
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Fierce brand
        fierce: {
          black: "#0A0A0A",
          ink: "#1A1A1A",
          orange: {
            DEFAULT: "#E67730",
            light: "#F39556",
            deep: "#C25A1B",
            glow: "#FFB37A",
          },
          cream: "#FFF6EE",
          gray: {
            soft: "#F5F2EE",
            mid: "#A8A39E",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "fierce-gradient":
          "linear-gradient(135deg, #C25A1B 0%, #E67730 50%, #F39556 100%)",
        "fierce-gradient-horizontal":
          "linear-gradient(90deg, #C25A1B 0%, #E67730 50%, #F39556 100%)",
        "fierce-glow":
          "radial-gradient(ellipse at center, rgba(230,119,48,0.18) 0%, rgba(10,10,10,0) 70%)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out forwards",
        fadeIn: "fadeIn 0.7s ease-out forwards",
        shimmer: "shimmer 3s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

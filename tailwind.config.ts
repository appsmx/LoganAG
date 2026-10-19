import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta LoganAG — tonos cálidos "madera/raíz" + verde follaje
        bark: {
          50: "#faf6f1",
          100: "#f0e6d9",
          200: "#dcc5a8",
          600: "#8a5a2b",
          700: "#6b4420",
          900: "#3d2612",
        },
        leaf: {
          100: "#e3f0dd",
          400: "#6aa84f",
          600: "#4a7a34",
          700: "#386027",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

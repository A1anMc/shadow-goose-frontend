/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sg: {
          primary: "#1A1A1A",
          secondary: "#FFFFFF",
          accent: "#FF6600",
          background: "#F5F5F5",
        },
        sge: {
          primary: "#2C5F2D",
          secondary: "#FFFFFF",
          accent: "#FFD700",
          background: "#F8F9FA",
        },
      },
      fontFamily: {
        heading: ["Poppins", "Inter", "ui-sans-serif", "system-ui"],
        body: ["Open Sans", "Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

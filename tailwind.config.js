/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
      },
      fontFamily: {
        heading: ["Poppins", "ui-sans-serif", "system-ui"],
        body: ["Open Sans", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};

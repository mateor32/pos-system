/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0a0a0f",
        sidebar: "#0f0f1a",
        card: "#13131f",
        primary: "#6366f1",
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        "text-primary": "#f1f5f9",
        "text-secondary": "#94a3b8",
        border: "rgba(255,255,255,0.06)",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px #6366f1",
        "glow-success": "0 0 0 1px #10b981",
        card: "0 4px 6px -1px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

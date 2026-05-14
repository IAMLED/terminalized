/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'Share Tech Mono'", "'Courier New'", "monospace"],
        orbitron: ["'Orbitron'", "monospace"],
      },
      colors: {
        bg:         "#0d1117",
        panel:      "#161b22",
        border:     "#21262d",
        text:       "#c8d0e0",
        textMuted:  "#8b949e",
        textDim:    "#484f58",
        green:      "#50fa7b",
        red:        "#ff5555",
        yellow:     "#f1fa8c",
        blue:       "#8be9fd",
        purple:     "#bd93f9",
        orange:     "#ffb86c",
      },
      keyframes: {
        glow:       { "0%,100%": { textShadow: "0 0 10px currentColor" }, "50%": { textShadow: "0 0 28px currentColor, 0 0 56px currentColor" } },
        fadeIn:     { from: { opacity: 0, transform: "translateY(10px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        blink:      { "0%,49%": { opacity: 1 }, "50%,100%": { opacity: 0 } },
        scanline:   { "0%": { top: "-10%" }, "100%": { top: "110%" } },
        shake:      { "0%,100%": { transform: "translateX(0)" }, "20%": { transform: "translateX(-8px)" }, "40%": { transform: "translateX(8px)" }, "60%": { transform: "translateX(-4px)" }, "80%": { transform: "translateX(4px)" } },
        pulseBtn:   { "0%,100%": { boxShadow: "0 0 0 0 rgba(80,250,123,0.32)" }, "50%": { boxShadow: "0 0 0 14px rgba(80,250,123,0)" } },
        bounceY:    { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
      animation: {
        glow:     "glow 3s ease-in-out infinite",
        fadeIn:   "fadeIn 0.35s ease both",
        blink:    "blink 1s infinite",
        scanline: "scanline 8s linear infinite",
        shake:    "shake 0.45s ease",
        pulseBtn: "pulseBtn 2s ease-in-out infinite",
        bounceY:  "bounceY 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ["var(--font-display)"],
                ui: ["var(--font-ui)"],
                data: ["var(--font-data)"],
            },
            fontSize: {
                // Display scale (Rajdhani)
                "display-xl": ["32px", { lineHeight: "1.2", letterSpacing: "0.02em" }],
                "display-lg": ["24px", { lineHeight: "1.2", letterSpacing: "0.02em" }],
                "display-md": ["18px", { lineHeight: "1.3", letterSpacing: "0.03em" }],
                "display-sm": ["14px", { lineHeight: "1.3", letterSpacing: "0.04em" }],

                // UI scale (Inter)
                "ui-lg": ["14px", { lineHeight: "1.4" }],
                "ui-md": ["12px", { lineHeight: "1.4" }],
                "ui-sm": ["11px", { lineHeight: "1.4" }],
                "ui-xs": ["10px", { lineHeight: "1.4" }],

                // Data scale (JetBrains Mono)
                "data-lg": ["16px", { lineHeight: "1.5" }],
                "data-md": ["13px", { lineHeight: "1.5" }],
                "data-sm": ["11px", { lineHeight: "1.5" }],
                "data-xs": ["9px", { lineHeight: "1.5" }],
            },
            letterSpacing: {
                tactical: "0.1em",
                "tactical-wide": "0.15em",
                "tactical-widest": "0.2em",
            },
            keyframes: {
                "scanline": {
                    "0%": { transform: "translateY(-100%)" },
                    "100%": { transform: "translateY(100%)" },
                },
                "glitch": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.8" },
                    "52%": { opacity: "1" },
                    "70%": { opacity: "0.9" },
                    "72%": { opacity: "1" },
                },
                "pulse-slow": {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.5" },
                },
            },
            animation: {
                "scanline": "scanline 8s linear infinite",
                "glitch": "glitch 4s infinite",
                "pulse-slow": "pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;

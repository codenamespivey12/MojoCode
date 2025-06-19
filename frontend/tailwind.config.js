/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react";
import typography from "@tailwindcss/typography";
export default {
  theme: {
    extend: {
      colors: {
        primary: "#9CA3AF", // neutral gray that complements black and red theme
        logo: "#9CA3AF", // neutral gray for logos and icons
        base: "#000000", // pure black background
        "base-secondary": "#1A1A1A", // dark gray background
        danger: "#EF4444", // bright red for errors
        success: "#10B981", // green for success states
        basic: "#6B7280", // neutral gray
        tertiary: "#3A3A3A", // lighter gray for better readability
        "tertiary-light": "#525252", // even lighter gray for borders
        content: "#F5F5F5", // light text
        "content-2": "#FFFFFF", // white text
        // Additional red variants
        "red-50": "#FEF2F2",
        "red-100": "#FEE2E2",
        "red-500": "#EF4444",
        "red-600": "#DC2626",
        "red-700": "#B91C1C",
        "red-800": "#991B1B",
        "red-900": "#7F1D1D",
        // Black variants
        "black-50": "#F8F8F8",
        "black-100": "#E5E5E5",
        "black-200": "#D4D4D4",
        "black-300": "#A3A3A3",
        "black-400": "#737373",
        "black-500": "#525252",
        "black-600": "#404040",
        "black-700": "#262626",
        "black-800": "#171717",
        "black-900": "#0A0A0A",
      },
    },
  },
  darkMode: "class",
  plugins: [typography, heroui()],
};

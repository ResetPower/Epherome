// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require("tailwindcss/colors");

module.exports = {
  darkMode: "class",
  variants: {
    extend: {
      backgroundColor: ["active"],
      backgroundOpacity: ["active"],
      display: ["group-hover"],
    },
  },
  theme: {
    extend: {
      colors: {
        background: "var(--eph-background-color)",
        primary: "var(--eph-primary-color)",
        secondary: "var(--eph-secondary-color)",
        shallow: "var(--eph-shallow-color)",
        divide: "var(--eph-divide-color)",
        card: "var(--eph-card-color)",
      },
    },
  },
};

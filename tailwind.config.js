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
        divide: "var(--eph-divide-color)",
        text: "var(--eph-text-color)",
        card: "var(--eph-card-color)",
      },
    },
  },
};

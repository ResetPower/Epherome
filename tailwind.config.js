module.exports = {
  darkMode: "class",
  mode: "jit",
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        background: "var(--eph-background-color)",
        contrast: "var(--eph-contrast-color)",
        primary: "var(--eph-primary-color)",
        secondary: "var(--eph-secondary-color)",
        shallow: "var(--eph-shallow-color)",
        divider: "var(--eph-divider-color)",
        card: "var(--eph-card-color)",
        danger: "var(--eph-danger-color)",
      },
    },
  },
};

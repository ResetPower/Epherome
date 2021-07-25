module.exports = {
  darkMode: "class",
  purge: ["./src/**/*.tsx"],
  variants: {
    extend: {
      backgroundColor: ["active"],
      backgroundOpacity: ["active"],
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

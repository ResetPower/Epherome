const colors = require("@resetpower/rcs/colors");

module.exports = {
  darkMode: "class",
  mode: "jit",
  content: ["./src/**/*.tsx", "./node_modules/@resetpower/rcs/**/*.js"],
  theme: {
    extend: {
      colors,
    },
  },
};

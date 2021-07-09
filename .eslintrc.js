module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["plugin:@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/no-unused-vars-experimental": 1,
    eqeqeq: ["error", "always"],
  },
};

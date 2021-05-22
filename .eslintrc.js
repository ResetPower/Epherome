module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": 1,
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/no-unused-vars-experimental": 1,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    eqeqeq: ["error", "always"],
  },
};

module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": 1,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/no-unused-vars-experimental": "error",
    eqeqeq: ["error", "always"],
  },
};

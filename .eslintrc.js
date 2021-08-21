module.exports = {
  overrides: [
    {
      files: ["*.js"],
      extends: ["eslint:recommended"],
      env: {
        es6: true,
        node: true,
      },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      rules: {
        "no-unused-vars": 0,
        "no-empty": [
          "warn",
          {
            allowEmptyCatch: true,
          },
        ],
      },
    },
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["@typescript-eslint", "react-hooks"],
      extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended",
        "prettier",
      ],
      rules: {
        "@typescript-eslint/no-unused-vars": 0,
        "@typescript-eslint/no-unused-vars-experimental": 1,
        "@typescript-eslint/no-empty-function": 1,
        "@typescript-eslint/no-var-requires": 0,
        eqeqeq: ["error", "always"],
      },
    },
  ],
};

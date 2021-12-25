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
        "no-unused-vars": 1,
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
      settings: {
        react: {
          version: "detect",
        },
      },
      plugins: ["@typescript-eslint", "react", "react-hooks"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/electron",
        "plugin:import/typescript",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "prettier",
      ],
      rules: {
        "@typescript-eslint/no-empty-function": 1,
        "@typescript-eslint/no-unused-vars": ["warn", { args: "after-used" }],
        "react/react-in-jsx-scope": 0,
        eqeqeq: ["error", "always"],
      },
    },
  ],
};

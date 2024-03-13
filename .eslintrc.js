/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:eslint-comments/recommended",
  ],
  plugins: ["@typescript-eslint", "eslint-comments", "simple-import-sort"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./packages/*/tsconfig.json"],
  },
  rules: {
    "@typescript-eslint/consistent-type-exports": [
      "error",
      {
        fixMixedExportsWithInlineTypeSpecifier: true,
      },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],
    // N.B. enabling this rule here instead of `eslint --report-unused-disable-directives` so that
    // we don't have to declare the CLI flag in every package's `package.json`. We can switch to
    // `linterOptions.reportUnusedDisableDirectives` in ESLint v9.0
    "eslint-comments/no-unused-disable": "error",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
  overrides: [
    {
      extends: ["plugin:@typescript-eslint/disable-type-checked"],
      files: ["./**/*.js", "./**/*.mjs", "./**/*.cjs"],
      parserOptions: {
        project: undefined,
      },
    },
    {
      files: ["./**/.eslintrc.js", "./**/.eslintrc.cjs", "./**/vite.*.mjs"],
      env: {
        node: true,
      },
    },
  ],
};

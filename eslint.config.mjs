import { fixupPluginRules } from "@eslint/compat";
import eslint from "@eslint/js";
import eslintCommentsPlugin from "eslint-plugin-eslint-comments";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...tseslint.configs.strictTypeChecked,
  {
    plugins: {
      "eslint-comments": eslintCommentsPlugin,
      "simple-import-sort": simpleImportSortPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...eslintCommentsPlugin.configs.recommended.rules,
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
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      parserOptions: {
        project: false,
      },
      globals: globals.nodeBuiltin,
    },
  },
  {
    files: ["packages/raga-app/src/client/**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": fixupPluginRules(reactHooksPlugin),
    },
    rules: {
      ...reactPlugin.configs["recommended"].rules,
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      // HACKHACK: until we can get Sass CSS modules type-checked
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      // unnecessary with TypeScript
      "react/prop-types": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    ignores: ["**/node_modules", "**/.vite", "/.yarn", "**/dist", "**/lib", "**/out"],
  },
);

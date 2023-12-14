/* eslint-env node */
module.exports = {
    root: true,
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@typescript-eslint/stylistic-type-checked",
        "plugin:@typescript-eslint/strict-type-checked",
    ],
    plugins: ["@typescript-eslint"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./packages/*/tsconfig.json"],
    },
    rules: {
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-unused-vars": [
            "error",
            { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
        ],
    },
    overrides: [
        {
            extends: ["plugin:@typescript-eslint/disable-type-checked"],
            files: ["./**/*.js", "./**/*.mjs"],
            parserOptions: {
                project: undefined,
            },
        },
        {
            files: ["./**/.eslintrc.js", "./**/vite.*.mjs"],
            env: {
                node: true,
            },
        },
    ],
};

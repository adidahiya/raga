/* eslint-env node */
module.exports = {
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
    root: true,
    overrides: [
        {
            extends: ["plugin:@typescript-eslint/disable-type-checked"],
            files: ["./**/*.js", "./**/*.mjs"],
            parserOptions: {
                project: undefined,
            },
        },
    ],
};

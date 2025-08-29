/** @type {import('eslint').Linter.Config} */
const eslintConfig = {
  extends: ["next/core-web-vitals", "next/typescript"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn", 
    "react-hooks/exhaustive-deps": "warn",
    "@next/next/no-img-element": "warn",
    "react/no-unescaped-entities": "warn"
  }
};

module.exports = eslintConfig;

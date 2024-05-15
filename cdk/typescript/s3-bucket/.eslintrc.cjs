module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json'],
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    "plugin:prettier/recommended"
  ],
  ignorePatterns: [
    "*.js",
    "*.d.ts",
  ],
  // For the list of rules supported by @typescript-eslint/eslint-plugin,
  // see: https://typescript-eslint.io/rules/
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/ban-ts-comment": [
      "error",
      {
        "ts-ignore": "allow-with-description"
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_"
      }
    ]
  },
};
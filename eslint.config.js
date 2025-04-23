const prettierPlugin = require('eslint-plugin-prettier');

const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    files: ['**/*.js'],

    plugins: {
      prettier: prettierPlugin,
    },

    rules: {
      ...prettierConfig.rules,

      'prettier/prettier': ['error'],

      // JavaScript recommended rules

      eqeqeq: ['error', 'always'], // Require === and !==

      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Disallow unused variables

      'no-console': ['warn'], // Warn about console.log statements

      strict: ['error', 'never'], // Disallow strict mode directives

      curly: ['error'], // Require curly braces for all control structures

      quotes: ['error', 'single'], // Enforce consistent single quotes

      semi: ['error', 'always'], // Enforce semicolons
    },
  },
];

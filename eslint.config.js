const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
import globals from "globals";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { eslintPluginPrettierRecommended }, extends: ["js/recommended"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
]);
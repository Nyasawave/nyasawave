import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js"],
    rules: {
      // Allow dynamic inline styles for animations and layout calculations
      "@next/next/no-style-component-with-dynamic-styles": "off",
      "react/no-unstable-nested-components": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "react/forbid-component-props": "off",
      "react-native/no-inline-styles": "off",
      "@typescript-eslint/no-explicit-any": "off", // Allow any in API routes for JSON deserialization
    },
  },
]);

export default eslintConfig;

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**", "public/vs/**"],
  },
];

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginReact from "eslint-plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    plugins: {
      import: eslintPluginImport,
      react: eslintPluginReact,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "linebreak-style": ["error", "unix"],
      "require-await": "error",
      "no-console": "warn",
      "import/prefer-default-export": "off",
      "react/react-in-jsx-scope": "off",
      "no-trailing-spaces": "error",
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js 내장 모듈
            "external", // npm 패키지 (react, next 등)
            "internal", // 프로젝트 내부 모듈
            "parent", // 상위 디렉토리
            "sibling", // 같은 디렉토리
            "index", // index 파일
          ],
          pathGroups: [
            // React, Next.js 등 주요 프레임워크를 맨 위로
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "react/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "next",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
            // 프로젝트 내부 모듈 순서 정의
            {
              pattern: "**/api/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "**/components/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "**/constants/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "**/hooks/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "**/lib/**",
              group: "internal",
              position: "before",
            },
            {
              pattern: "**/pages/**",
              group: "internal",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "next"],
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
  },
];

export default eslintConfig;

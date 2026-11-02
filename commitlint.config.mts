import type { UserConfig } from "@commitlint/types";

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // @see: https://commitlint.js.org/reference/rules.html
    "body-leading-blank": [2, "always"],
    "footer-leading-blank": [1, "always"],
    "header-max-length": [2, "always", 108],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
    "subject-case": [0],
    "type-enum": [
      2,
      "always",
      [
        // 新增功能
        "feat",

        // 修复 Bug
        "fix",

        // 文档变更
        "docs",

        // 不影响代码含义的格式调整（空格、缩进、分号等）
        "style",

        // 重构代码，不新增功能，也不修复 Bug
        "refactor",

        // 性能优化
        "perf",

        // 添加或修改测试
        "test",

        // 构建系统或外部依赖变更（如 Vite、Rollup、TypeScript、npm 包等）
        "build",

        // CI 配置和脚本变更（如 GitHub Actions、GitLab CI 等）
        "ci",

        // 其他不涉及生产代码的维护性变更
        "chore",

        // 撤销之前的提交
        "revert",

        // 开发过程中的临时提交，尚未完成的工作
        "wip",

        // TypeScript 类型定义相关变更
        "types",

        // 发布相关变更（如版本号、发布配置、Release 准备等）
        "release",
      ],
    ],
  },
} satisfies UserConfig;

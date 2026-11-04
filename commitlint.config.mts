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
        "feat", // 新增功能
        "fix", // 修复 Bug
        "docs", // 文档变更
        "style", // 不影响代码含义的格式调整（空格、缩进、分号等）
        "refactor", // 重构代码，不新增功能，也不修复 Bug
        "perf", // 性能优化
        "test", // 添加或修改测试
        "build", // 构建系统或外部依赖变更（如 Vite、Rollup、TypeScript、npm 包等）
        "ci", // CI 配置和脚本变更（如 GitHub Actions、GitLab CI 等）
        "chore", // 其他不涉及生产代码的维护性变更
        "revert", // 撤销之前的提交
        "wip", // 开发过程中的临时提交，尚未完成的工作
        "types", // TypeScript 类型定义相关变更
        "release", // 发布相关变更（如版本号、发布配置、Release 准备等）
      ],
    ],
  },
} satisfies UserConfig;

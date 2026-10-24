# headify

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://www.lujiahao.com/sponsor)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![Test](https://img.shields.io/github/actions/workflow/status/ColoristLab/headify/tests.yml?label=Test&logo=github&style=flat-square&branch=main)](https://github.com/ColoristLab/headify/actions/workflows/tests.yml)
[![Node](https://img.shields.io/node/v/headify.svg)](https://nodejs.org/en/about/previous-releases)
[![Vitest](https://img.shields.io/badge/tested%20with-vitest-fcc72b.svg?logo=vitest)](https://vitest.dev/)
[![codecov](https://codecov.io/github/ColoristLab/headify/graph/badge.svg?token=YR846BMB6Y)](https://codecov.io/github/ColoristLab/headify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ColoristLab/headify/blob/main/LICENSE)

为文件添加头部横幅注释的命令行工具，默认从 package.json 读取项目信息。

## 安装

```bash
npm install -D headify
```

## 使用

支持 Glob 路径模式。

```bash
# 使用默认模板
headify "dist/**/*.{js,css}"

# 使用自定义模板
headify "dist/**/*.js" --template banner.mjs

# 排除文件
headify "dist/**/*.js" --exclude "dist/vendor/**"

# 预览变更
headify "dist/**/*.js" --dry-run
```

## 自定义模板

支持js、ts、mjs、cjs、mts、cts后缀的js文件导出默认函数

创建 `banner.mjs`：

```js
export default function (context) {
  const contributors = ["jack", "tom"];

  return dedent`
    /*!
     * ${context.package.name} v${context.package.version}
     * Contributors: ${contributors.join(", ")}
     * File: ${context.file.path}
     */
  `;
}
```

运行：

```bash
headify "dist/**/*.js" --template banner.mjs
```

默认情况下，headify 从项目的 `package.json` 读取元数据，并使用内置模板生成文件头部。

## 上下文数据

## 命令行选项

| 选项                      | 描述                      |
| ------------------------- | ------------------------- |
| `-t, --template <path>`   | 自定义模板文件路径        |
| `--exclude <patterns...>` | 排除文件或目录，支持 Glob |
| `--dry-run`               | 预览操作，不修改文件      |
| `-V, --version`           | 显示版本号                |
| `-h, --help`              | 显示帮助信息              |

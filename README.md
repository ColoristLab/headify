# headmark

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://www.lujiahao.com/sponsor)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![Test](https://img.shields.io/github/actions/workflow/status/ColoristLab/headmark/tests.yml?label=Test&logo=github&style=flat-square&branch=main)](https://github.com/ColoristLab/headmark/actions/workflows/tests.yml)
[![Node](https://img.shields.io/node/v/headmark.svg)](https://nodejs.org/en/about/previous-releases)
[![Vitest](https://img.shields.io/badge/tested%20with-vitest-fcc72b.svg?logo=vitest)](https://vitest.dev/)
[![codecov](https://codecov.io/github/ColoristLab/headmark/graph/badge.svg?token=YR846BMB6Y)](https://codecov.io/github/ColoristLab/headmark)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ColoristLab/headmark/blob/main/LICENSE)

一个轻量级命令行工具，通过模板为文件添加头部注释。

## 安装

```bash
npm install -D headmark
```

## 使用

支持 Glob 路径模式。

```bash
# 使用默认模板
headmark "dist/**/*.{js,css}"

# 使用自定义模板
headmark "dist/**/*.js" --template banner.eta

# 排除文件
headmark "dist/**/*.js" --exclude "dist/vendor/**"

# 预览变更
headmark "dist/**/*.js" --dry-run
```

## 自定义模板

使用 [Eta](https://eta.js.org/) 模板语法编写文件头部。

创建 `banner.eta`：

```eta
/*!
 * <%= it.package.name %> v<%= it.package.version %>
 *
 * Copyright (c) <%= it.year %> <%= it.package.author %>
 * Licensed under the <%= it.package.license %> license
 */
```

运行：

```bash
headmark "dist/**/*.js" --template banner.eta
```

默认情况下，headmark 从项目的 `package.json` 读取元数据，并使用内置模板生成文件头部。

## 命令行选项

| 选项                      | 描述                      |
| ------------------------- | ------------------------- |
| `-t, --template <path>`   | 自定义模板文件路径        |
| `--exclude <patterns...>` | 排除文件或目录，支持 Glob |
| `--dry-run`               | 预览操作，不修改文件      |
| `-V, --version`           | 显示版本号                |
| `-h, --help`              | 显示帮助信息              |

# 快速开始

## 安装

::: code-group

```sh [npm]
npm add -D headify
```

```sh [pnpm]
pnpm add -D headify
```

```sh [yarn]
yarn add -D headify
```

```sh [bun]
bun add -D headify
```

:::

安装完成后，在项目根目录执行 `headify <...files>` 命令，即可为指定文件添加版权声明。

## 基本用法

### 指定文件

直接指定需要处理的文件：

```sh
headify dist/css/app.css dist/js/app.js
```

### 匹配多个文件

使用 Glob 模式批量匹配文件：

```sh
# 处理所有 CSS 文件
headify dist/**/*.css

# 处理所有 JavaScript 文件
headify dist/**/*.js

# 同时处理 CSS 和 JavaScript 文件
headify "dist/**/*.{css,js}"
```

> [!WARNING]
> 最后一种写法使用 **Brace Expansion（花括号展开）**，可以在一个 Glob 模式中匹配多种文件扩展名。建议使用引号包裹 Glob 模式，避免 Shell 提前展开或解释其中的特殊字符。

### 排除文件

使用 `--exclude` 排除不需要处理的文件或目录，支持 Glob 模式：

```sh
headify "dist/**/*.{css,js}" --exclude "dist/vendor/**"
```

以上命令会处理 `dist` 目录下的 CSS 和 JavaScript 文件，但跳过 `dist/vendor` 目录中的文件。

### 预览修改

使用 `--dry-run` 预览处理结果，而不实际修改文件：

```sh
headify "dist/**/*.{css,js}" --dry-run
```

预览模式会显示匹配的文件、预计修改的文件以及无需修改的文件。

确认结果无误后，移除 `--dry-run` 即可执行实际修改。

## 实际示例

`package.json` 配置示例：

```json [package.json]
{
  "name": "my-project",
  "version": "1.0.0",
  "homepage": "https://example.com",
  "author": "Example Author",
  "license": "MIT"
  ...
}
```

会生成如下横幅注释：

```text
/*!
 * my-project v1.0.0
 * https://example.com
 *
 * Copyright (c) 2026 Example Author
 * Licensed under the MIT license
 */
```

## 自定义 Banner

如果默认的文件头不符合项目需求，可以通过 `--template` 指定自定义模板文件。

有关模板上下文、模板格式和完整示例，请参阅[自定义模板](./templates.md)。

# 自定义模板

Headify 支持通过 JavaScript 或 TypeScript 模块自定义文件头。模板可以访问项目元数据、当前年份和正在处理的文件信息，从而生成符合项目需求的 Banner。

使用 `--template` 指定模板文件：

```sh
headify "dist/**/*.{css,js}" --template ./banner.js
```

## 模板示例

Headify 支持`.js`、 `.ts`、`.mjs`、`.mts`、`.cjs`、`.cts`为拓展名的模板文件。

> [!TIP]
> `.js` 和 `.ts` 模板的模块格式可能受到 `package.json` 中 `type` 字段的影响。如果希望明确指定模块格式，建议使用 `.mjs` / `.mts`（ESM）或 `.cjs` / `.cts`（CommonJS）扩展名。

模板必须默认导出一个函数，以下是自定义模板示例：

::: code-group

```js [banner.mjs]
/** @type {import("headify").BannerTemplate} */
export default ({ package: pkg, year }) => {
  return `/*!
  * ${pkg.name} v${pkg.version} (${pkg.homepage})
  * Copyright 2015-${year} ${pkg.author}
  * Licensed under the ${pkg.license} license
  */`;
};
```

```ts [banner.mts]
import { type TemplateContext } from "headify";

export default ({ package: pkg, year }: TemplateContext) => {
  return `/*!
  * ${pkg.name} v${pkg.version} (${pkg.homepage})
  * Copyright 2015-${year} ${pkg.author}
  * Licensed under the ${pkg.license} license
  */`;
};
```

```js [banner.cjs]
/** @type {import("headify").BannerTemplate} */
module.exports = ({ package: pkg, year }) => {
  return `/*!
  * ${pkg.name} v${pkg.version} (${pkg.homepage})
  * Copyright 2015-${year} ${pkg.author}
  * Licensed under the ${pkg.license} license
  */`;
};
```

```ts [banner.cts]
import type { TemplateContext } from "headify";

module.exports = ({ package: pkg, year }: TemplateContext) => {
  return `/*!
  * ${pkg.name} v${pkg.version} (${pkg.homepage})
  * Copyright 2015-${year} ${pkg.author}
  * Licensed under the ${pkg.license} license
  */`;
};
```

:::

## 其它示例

### 使用助手函数

Headify 提供了一个助手函数`dedent`，该函数的作用是移除多行字符串每行共有的前导缩进，使模板字符串保持代码缩进的同时，输出整洁、格式统一的文本。让返回自定义 Banner 的时候更容易：

```js
import { dedent } from "headify";

/** @type {import("headify").BannerTemplate} */
export default ({ package: pkg, year }) => {
  return dedent`
  /*!
   * ${pkg.name} v${pkg.version} (${pkg.homepage})
   * Copyright 2015-${year} ${pkg.author}
   * Licensed under the ${pkg.license} license
   */
  `;
};
```

### 针对特定文件进行特殊处理

以 Bootstrap 的 [构建产物](https://github.com/twbs/bootstrap/tree/main/dist) 为例，演示如何针对特定文件自定义 Banner，并保持与 Bootstrap 一致的版权注释格式。

```js
import { dedent } from "headify";

/** @type {import("headify").BannerTemplate} */
export default ({ package: pkg, year, file }) => {
  const name = pkg.name[0].toUpperCase() + pkg.name.slice(1);
  const licenseUrl = "https://github.com/twbs/bootstrap/blob/main/LICENSE";

  const names = {
    "bootstrap-grid": "Grid",
    "bootstrap-reboot": "Reboot",
    "bootstrap-utilities": "Utilities",
  };

  const suffix = Object.entries(names).find(([prefix]) => file.name.startsWith(prefix))?.[1];

  return dedent`
    /*!
     * ${name}${suffix ? ` ${suffix}` : ""} v${pkg.version} (${pkg.homepage})
     * Copyright 2011-${year} ${pkg.author}
     * Licensed under ${pkg.license} (${licenseUrl})
     */
  `;
};
```

执行命令：

```bash
headify "dist/**/*.{js,css}" -t ./banner.mjs
```

例如，处理 `bootstrap-grid.css` 时，生成的 Banner 为：

```text
/*!
  * Bootstrap Grid v6.0.0-alpha.1 (https://getbootstrap.com/)
  * Copyright 2011-2026 The Bootstrap Authors
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
```

处理 `bootstrap-grid.css` 时，名称则会自动变成 `Bootstrap Grid`，对于 `bootstrap.css` 等没有匹配特殊前缀的文件，则只使用 `Bootstrap`。

## 模板上下文

Headify 执行模板函数时，会传入一个上下文对象。模板可以通过解构获取需要的信息。

```ts
interface TemplateContext {
  package: PackageJson;
  year: number;
  file: {
    path: string;
    name: string;
    basename: string;
    ext: string;
  };
}
```

### 项目元数据 `package`

`package` 包含项目根目录下 `package.json` 的内容，可以读取其中的项目元数据。

| 属性               | 说明       |
| ------------------ | ---------- |
| `package.name`     | 项目名称   |
| `package.version`  | 项目版本   |
| `package.homepage` | 项目主页   |
| `package.author`   | 项目作者   |
| `package.license`  | 项目许可证 |

以上仅为常用字段。其他已配置的 `package.json` 字段也可以通过 `package` 访问。

### 当前年份 `year`

`year` 是执行 Headify 时获取的当前年份，类型为 `number`。

例如，当前年份为 `2026` 时，`year` 的值为 `2026`。

### 当前文件 `file`

`file` 包含正在处理的文件信息：

| 属性            | 说明                                        | 示例               |
| --------------- | ------------------------------------------- | ------------------ |
| `file.path`     | 相对于工作目录的文件路径，统一使用 `/` 分隔 | `dist/css/app.css` |
| `file.name`     | 文件名，包含扩展名                          | `app.css`          |
| `file.basename` | 文件名，不包含扩展名                        | `app`              |
| `file.ext`      | 文件扩展名，包含前导点                      | `.css`             |

这些信息可以用于生成与文件名、路径或扩展名相关的 Banner。

## 异步模板

模板函数也可以是异步函数，返回 `Promise<string>`。例如：

```ts
export default async ({ package: pkg, year }) => {
  // 在这里执行异步操作
  return `/*!
 * ${pkg.name} v${pkg.version}
 * Copyright (c) ${year} ${pkg.author}
 */`;
};
```

无论使用同步还是异步模板，最终都必须返回字符串。

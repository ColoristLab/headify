# Node.js API

Headify 提供了 JavaScript API，可以在 Node.js 项目中以编程方式为文件添加版权声明。

`headify(patterns, options)` 接收一个文件匹配规则数组和一个可选的配置对象，并返回一个解析为`HeadifyResult` 的 Promise。

与命令行不同，API 不会解析命令行参数。所有配置选项都可以直接通过参数传入。

```js
import { headify } from "headify";

const results = await headify(["src/**/*.js"], {
  startYear: 2024,
  template: "./banner.mts",
  dryRun: true,
});

console.log(results);
```

## 配置选项

`options` 参数支持与命令行配置相同的选项，可以直接通过 JavaScript 对象传入。

| 选项        | 类型       | 默认值          | 描述                                                          |
| ----------- | ---------- | --------------- | ------------------------------------------------------------- |
| `cwd`       | `string`   | `process.cwd()` | 工作目录，用于解析文件匹配规则和查找 `package.json`。         |
| `startYear` | `number`   | 当前年份        | 版权声明的起始年份。 版权声明的起始年份。版权声明的起始年份。 |
| `template`  | `string`   | `""`            | 版权声明模板。                                                |
| `exclude`   | `string[]` | `[]`            | 需要排除的文件匹配规则。                                      |
| `dryRun`    | `boolean`  | `false`         | 预览修改结果，不实际修改文件。                                |

有关模板配置的详细信息，请参阅[自定义模板](./templates.md)。

## 返回结果

`headify()` 返回一个 Promise，成功时会解析为包含执行摘要和各文件处理结果的对象。

```js
{
  template: "",
  dryRun: true,
  total: 2,
  updated: 0,
  unchanged: 1,
  wouldUpdate: 1,
  elapsed: 12,
  files: [
    { path: "src/index.js", status: "wouldUpdate" },
    { path: "src/utils.js", status: "unchanged" }
  ]
}
```

| 字段          | 描述                           |
| ------------- | ------------------------------ |
| `template`    | 本次操作使用的模板。           |
| `dryRun`      | 是否处于预览模式。             |
| `total`       | 匹配到的文件总数。             |
| `updated`     | 成功修改的文件数量。           |
| `unchanged`   | 无需修改的文件数量。           |
| `wouldUpdate` | 预览模式下预计修改的文件数量。 |
| `elapsed`     | 执行耗时，单位为毫秒。         |
| `files`       | 各文件的处理结果。             |

`files` 中的每个条目包含以下字段：

| 字段     | 描述                                                    |
| -------- | ------------------------------------------------------- |
| `path`   | 相对于 `cwd` 的文件路径，统一使用正斜杠。               |
| `status` | 文件处理状态：`updated`、`unchanged` 或 `wouldUpdate`。 |

如果没有匹配到任何文件，Headify 会直接返回空结果，不会读取 `package.json`。

## TypeScript

Headify 内置了 TypeScript 类型声明。

除了 `headify` 函数外，包还导出了以下类型：

| 类型             | 描述                            |
| ---------------- | ------------------------------- |
| `HeadifyOptions` | 传递给 `headify()` 的配置选项。 |
| `HeadifyResult`  | `headify()` 返回的结果。        |
| `FileResult`     | 单个文件的处理结果。            |
| `FileStatus`     | 文件处理状态。                  |

```ts
import { headify, type HeadifyOptions } from "headify";

const options: HeadifyOptions = {
  startYear: 2024,
  dryRun: true,
};

const results = await headify(["src/**/*.js"], options);
```

## 错误处理

当传入的文件匹配规则或配置选项包含无效值时，`headify()` 会抛出 `TypeError`。

由于 `headify()` 是异步函数，文件操作、读取 `package.json` 或解析模板时发生的错误，也可能导致返回的 Promise 被拒绝。

可以通过 `try...catch` 捕获并处理这些错误：

```js
import { headify } from "headify";

try {
  const results = await headify(["src/**/*.js"]);
  console.log(results);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
```

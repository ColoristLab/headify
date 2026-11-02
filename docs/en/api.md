# Node.js API

`Headify` provides a JavaScript API that can be used to programmatically add copyright notices to files in Node.js projects.

`headify(patterns, options)` accepts an array of file patterns and an optional configuration object, and returns a Promise that resolves to a `HeadifyResult`.

Unlike the CLI, the API does not parse command-line arguments. All configuration options can be passed directly as parameters.

```js
import { headify } from "headify";

const results = await headify(["src/**/*.js"], {
  startYear: 2024,
  template: "./banner.mts",
  dryRun: true,
});

console.log(results);
```

## Configuration Options

The `options` parameter supports the same options as the CLI configuration, and they can be passed directly as a JavaScript object.

| Option      | Type       | Default         | Description                                                              |
| ----------- | ---------- | --------------- | ------------------------------------------------------------------------ |
| `cwd`       | `string`   | `process.cwd()` | Working directory used to resolve file patterns and find `package.json`. |
| `startYear` | `number`   | Current year    | The start year of the copyright notice.                                  |
| `template`  | `string`   | `""`            | The copyright notice template.                                           |
| `exclude`   | `string[]` | `[]`            | File patterns to exclude.                                                |
| `dryRun`    | `boolean`  | `false`         | Preview changes without actually modifying files.                        |

For details about template configuration, see [Custom Templates](./templates.md).

## Return Results

`headify()` returns a Promise that, on success, resolves to an object containing an execution summary and per-file processing results.

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

| Field         | Description                                              |
| ------------- | -------------------------------------------------------- |
| `template`    | The template used for this operation.                    |
| `dryRun`      | Whether in preview mode.                                 |
| `total`       | Total number of matched files.                           |
| `updated`     | Number of successfully modified files.                   |
| `unchanged`   | Number of files that did not need modification.          |
| `wouldUpdate` | Number of files expected to be modified in preview mode. |
| `elapsed`     | Execution time in milliseconds.                          |
| `files`       | Processing result for each file.                         |

Each entry in `files` contains the following fields:

| Field    | Description                                                       |
| -------- | ----------------------------------------------------------------- |
| `path`   | File path relative to `cwd`, always using forward slashes.        |
| `status` | File processing status: `updated`, `unchanged`, or `wouldUpdate`. |

If no files match, `Headify` returns an empty result directly and does not read `package.json`.

## TypeScript

`Headify` includes built-in TypeScript type declarations.

In addition to the `headify` function, the package also exports the following types:

| Type             | Description                                  |
| ---------------- | -------------------------------------------- |
| `HeadifyOptions` | Configuration options passed to `headify()`. |
| `HeadifyResult`  | The result returned by `headify()`.          |
| `FileResult`     | Processing result for a single file.         |
| `FileStatus`     | File processing status.                      |

```ts
import { headify, type HeadifyOptions } from "headify";

const options: HeadifyOptions = {
  startYear: 2024,
  dryRun: true,
};

const results = await headify(["src/**/*.js"], options);
```

## Error Handling

When the passed file patterns or configuration options contain invalid values, `headify()` throws a `TypeError`.

Because `headify()` is an asynchronous function, errors that occur during file operations, reading `package.json`, or parsing templates may also cause the returned Promise to be rejected.

You can catch and handle these errors with `try...catch`:

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

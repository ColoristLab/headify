# Getting Started

## Installation

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

To verify that `headify` is installed correctly, run the following command in your project directory:

```bash
./node_modules/.bin/headify --version
```

You can also view available CLI options and examples with the following command:

```bash
./node_modules/.bin/headify --help
```

> [!TIP]
> For more help with CLI usage, refer to the [Command Line](./cli) page.

## Basic Usage

### Specify Files

Directly specify the files to process:

```sh
headify dist/css/app.css dist/js/app.js
```

### Match Multiple Files

Use Glob patterns to match files in batches:

```sh
# Process all CSS files
headify dist/**/*.css

# Process all JavaScript files
headify dist/**/*.js

# Process both CSS and JavaScript files
headify "dist/**/*.{css,js}"
```

> [!WARNING]
> The last form uses **Brace Expansion**, which allows matching multiple file extensions in a single Glob pattern. The Glob pattern must be wrapped in quotes to prevent the shell from expanding or interpreting special characters in advance.

### Exclude Files

Use `--exclude` to exclude files or directories that do not need processing; Glob patterns are supported:

```sh
headify "dist/**/*.{css,js}" --exclude "dist/vendor/**"
```

The above command processes CSS and JavaScript files under the `dist` directory but skips files in the `dist/vendor` directory.

### Preview Changes

Use `--dry-run` to preview processing results without actually modifying files:

```sh
headify "dist/**/*.{css,js}" --dry-run
```

Preview mode displays matched files, files expected to be modified, and files that do not need modification.

After confirming the results are correct, remove `--dry-run` to perform the actual modifications.

## Real-world Example

Example `package.json` configuration:

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

The following banner comment will be generated:

```text
/*!
 * my-project v1.0.0
 * https://example.com
 *
 * Copyright (c) 2026 Example Author
 * Licensed under the MIT license
 */
```

## Custom Banner

If the default file header does not meet your project requirements, you can specify a custom template file via `--template`.

For template context, template format, and complete examples, see [Custom Templates](./templates.md).

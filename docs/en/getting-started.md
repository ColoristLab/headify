# Quick Start

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 22.18.0 or later.

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

### Using the CLI

To verify that `headify` is installed correctly, run the following command in your project directory:

```bash
./node_modules/.bin/headify --version
```

You can also view the available CLI options and examples with the following command:

```bash
./node_modules/.bin/headify --help
```

### Using the CLI in npm Scripts

To simplify the command, you can add it to the scripts in `package.json`:

```json{5} [package.json]
{
  "name": "my-project",
  "type": "module",
  "scripts": {
    "banner": "headify \"dist/**/*.{css,js}\""
  },
  "devDependencies": {
    "headify": "^0.1.3"
  }
}
```

Now you can add copyright comments to the specified files with the following command:

```sh
npm run banner
```

## Basic Usage

### Specifying Files

Specify the files to process directly:

```sh
headify dist/css/app.css dist/js/app.js
```

### Matching Multiple Files

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
> The last form uses **Brace Expansion**, which allows multiple file extensions to be matched in a single Glob pattern. The Glob pattern must be wrapped in quotes to prevent the shell from expanding it early or interpreting special characters within it.

### Excluding Files

Use `--exclude` to exclude files or directories that do not need to be processed. Glob patterns are supported:

```sh
headify "dist/**/*.{css,js}" --exclude "dist/vendor/**"
```

The above command processes CSS and JavaScript files in the `dist` directory but skips files in the `dist/vendor` directory.

### Previewing Changes

Use `--dry-run` to preview the processing results without actually modifying files:

```sh
headify "dist/**/*.{css,js}" --dry-run
```

Preview mode displays the matched files, the files expected to be modified, and the files that do not need modification.

After confirming that the results are correct, remove `--dry-run` to perform the actual modifications.

### Automatically Reading Project Metadata

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

Run the following command:

```sh
headify "dist/**/*.{css,js}"
```

It generates the following banner comment:

```text
/*!
 * my-project v1.0.0
 * https://example.com
 *
 * Copyright (c) 2026 Example Author
 * Licensed under the MIT license
 */
```

### Start Year <Badge type="tip">from @0.2.0</Badge>

```sh
headify "dist/**/*.{css,js}" --start-year 2022
```

It generates the following banner comment:

```text
/*!
 * my-project v1.0.0
 * https://example.com
 *
 * Copyright (c) 2022-2026 Example Author // [!code highlight]
 * Licensed under the MIT license
 */
```

### Automatically Ignored When homepage Is Absent <Badge type="tip">from @0.2.0</Badge>

Assume your `package.json` does not have a `homepage` field configured:

```json [package.json]
{
  "name": "my-project",
  "version": "1.0.0",
  "homepage": "https://example.com", // [!code --]
  "author": "Example Author",
  "license": "MIT"
  ...
}
```

Run the following command:

```sh
headify "dist/**/*.{css,js}"
```

Then Headify automatically ignores `homepage` and generates the following banner comment:

```text
/*!
 * my-project v1.0.0
 *
 * Copyright (c) 2026 Example Author
 * Licensed under the MIT license
 */
```

## Custom Banner

If the default file header does not meet your project's needs, you can specify a custom template file with `--template`.

For template context, template formats, and complete examples, see [Custom Templates](./templates.md).

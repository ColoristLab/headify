# Custom Templates

Headify supports customizing file headers through JavaScript or TypeScript modules. Templates can access project metadata, the current year, and information about the file being processed, so you can generate Banners that meet your project's needs.

Use `--template` to specify a template file:

```sh
headify "dist/**/*.{css,js}" --template ./banner.js
```

## Template Examples

Headify supports template files with the extensions `.js`, `.ts`, `.mjs`, `.mts`, `.cjs`, and `.cts`.

> [!TIP]
> The module format of `.js` and `.ts` templates may be affected by the `type` field in `package.json`. If you want to explicitly specify the module format, it is recommended to use the `.mjs` / `.mts` (ESM) or `.cjs` / `.cts` (CommonJS) extensions.

A template must default-export a function. Below are custom template examples:

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

## Other Examples

### Using the Helper Function

Headify provides a helper function called `dedent`. Its purpose is to remove the common leading indentation from each line of a multiline string, so that template strings can keep code indentation while outputting clean, consistently formatted text. This makes it easier to return custom Banners:

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

### Special Handling for Specific Files

Using Bootstrap's [build artifacts](https://github.com/twbs/bootstrap/tree/main/dist) as an example, this demonstrates how to customize the Banner for specific files while maintaining a copyright comment format consistent with Bootstrap.

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

Run the command:

```bash
headify "dist/**/*.{js,css}" -t ./banner.mjs
```

For example, when processing `bootstrap-grid.css`, the generated Banner is:

```text
/*!
  * Bootstrap Grid v6.0.0-alpha.1 (https://getbootstrap.com/)
  * Copyright 2011-2026 The Bootstrap Authors
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)
  */
```

When processing `bootstrap-grid.css`, the name automatically becomes `Bootstrap Grid`. For files such as `bootstrap.css` that do not match a special prefix, only `Bootstrap` is used.

## Template Context

When Headify executes the template function, it passes in a context object. Templates can destructure the information they need.

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

### Project Metadata `package`

`package` contains the contents of `package.json` in the project root directory, allowing you to read project metadata from it.

| Property           | Description      |
| ------------------ | ---------------- |
| `package.name`     | Project name     |
| `package.version`  | Project version  |
| `package.homepage` | Project homepage |
| `package.author`   | Project author   |
| `package.license`  | Project license  |

The above are only commonly used fields. Other configured `package.json` fields can also be accessed through `package`.

### Current Year `year`

`year` is the current year obtained when Headify is executed, and its type is `number`.

For example, if the current year is `2026`, the value of `year` is `2026`.

### Current File `file`

`file` contains information about the file being processed:

| Property        | Description                                                                    | Example            |
| --------------- | ------------------------------------------------------------------------------ | ------------------ |
| `file.path`     | File path relative to the working directory, always using `/` as the separator | `dist/css/app.css` |
| `file.name`     | File name, including extension                                                 | `app.css`          |
| `file.basename` | File name, excluding extension                                                 | `app`              |
| `file.ext`      | File extension, including the leading dot                                      | `.css`             |

This information can be used to generate Banners related to file names, paths, or extensions.

## Async Templates

Template functions can also be async functions that return `Promise<string>`. For example:

```ts
export default async ({ package: pkg, year }) => {
  // Perform asynchronous operations here
  return `/*!
 * ${pkg.name} v${pkg.version}
 * Copyright (c) ${year} ${pkg.author}
 */`;
};
```

Whether you use a synchronous or asynchronous template, it must ultimately return a string.

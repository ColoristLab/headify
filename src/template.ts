import { defineTemplate, dedent } from "./index.ts";
import type { HeadmarkContext } from "./types.js";

/**
 * 默认 banner 模板。
 */
export const defaultTemplate = defineTemplate((ctx: HeadmarkContext) => {
  const { package: pkg, year, startYear } = ctx;

  const copyright = startYear ? `${startYear}-${year}` : String(year);

  return dedent`
    /*!
     * ${pkg.name} v${pkg.version}
     * ${pkg.homepage}
     *
     * Copyright (c) ${copyright} ${pkg.author}
     * Licensed under the ${pkg.license} license
     */
  `;
});

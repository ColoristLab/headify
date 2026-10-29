import { dedent } from "ts-dedent";

import type { TemplateContext } from "./types.ts";

/**
 * 默认 banner 模板。
 */
export default (ctx: TemplateContext) => {
  const { package: pkg, year } = ctx;

  return dedent`
    /*!
     * ${pkg.name} v${pkg.version}
     * ${pkg.homepage}
     *
     * Copyright (c) ${year} ${pkg.author}
     * Licensed under the ${pkg.license} license
     */
  `;
};

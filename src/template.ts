import { dedent } from "ts-dedent";

import type { TemplateContext } from "./types.ts";

/**
 * 默认 banner 模板。
 */
export default (ctx: TemplateContext) => {
  const { package: pkg, year, startYear } = ctx;

  const copyrightYear = startYear < year ? `${startYear}-${year}` : year;

  return dedent`
    /*!
     * ${pkg.name} v${pkg.version}
     * ${pkg.homepage ? `${pkg.homepage}\n *` : ""}
     * Copyright (c) ${copyrightYear} ${pkg.author}
     * Licensed under the ${pkg.license} license
     */
  `;
};

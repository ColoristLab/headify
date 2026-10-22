import { dedent } from "ts-dedent";

interface PackageInfo {
  name: string;
  version: string;
  author: string;
}

interface TemplateContext {
  package: PackageInfo;
  year: string | number;
  startYear?: string | number;
  contributors?: string[];
}

module.exports = function defineTemplate(ctx: TemplateContext): string {
  const { package: pkg, year, startYear, contributors = [] } = ctx;

  const copyright = startYear ? `${startYear}-${year}` : String(year);

  return dedent`
    /*!
     * ${pkg.name} v${pkg.version}
     * Copyright (c) ${copyright} ${pkg.author}
     *
     ${
       contributors.length
         ? ` * Contributors:\n${contributors.map((name) => ` * ${name}`).join("\n")}`
         : ""
     }
     */
  `;
};

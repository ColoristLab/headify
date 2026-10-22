import { dedent } from "ts-dedent";

export default function defineTemplate(ctx) {
  const { package: pkg, year, startYear, contributors = [] } = ctx;

  const copyright = startYear ? `${startYear}-${year}` : String(year);

  const contributorsSection = contributors.length
    ? `* Contributors:\n${contributors.map((name) => `* ${name}`).join("\n")}`
    : "";

  return dedent`
    /*!
     * ${pkg.name} v${pkg.version}
     * Copyright (c) ${copyright} ${pkg.author}
     *
     ${contributorsSection}
     */
  `;
}

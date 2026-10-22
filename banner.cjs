module.exports = function defineTemplate(ctx) {
  const { package: pkg, year, startYear, contributors = [] } = ctx;

  const copyright = startYear ? `${startYear}-${year}` : String(year);

  const contributorSection = contributors.length
    ? ` * Contributors:\n${contributors.map((name) => ` * ${name}`).join("\n")}`
    : "";

  return `/*!
 * ${pkg.name} v${pkg.version}
 * Copyright (c) ${copyright} ${pkg.author}
 *
${contributorSection}
 */
`;
};

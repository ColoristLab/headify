export default function defineTemplate(ctx) {
  return `/*!
 * ${ctx.package.name} v${ctx.package.version}
 * Copyright (c) ${ctx.year} ${ctx.package.author}
 */
`;
}

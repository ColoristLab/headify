import { defineTemplate } from "headmark";

export default defineTemplate((ctx) => {
  return `/*!
 * ${pkg.name} v${pkg.version}
 * Copyright (c) ${year} ${pkg.author}
 */`;
});

import type { HeadmarkContext } from "./types.js";

export type * from "./types.js";
export { headmark } from "./headmark.js";

export const defineTemplate = (template: (context: HeadmarkContext) => string | Promise<string>) =>
  template;

export { dedent } from "ts-dedent";

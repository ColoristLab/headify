import type { DefineTemplate, HeadmarkContext } from "./types.ts";

export const defineTemplate = <TContext = HeadmarkContext>(
  template: DefineTemplate<TContext>,
): DefineTemplate<TContext> => template;

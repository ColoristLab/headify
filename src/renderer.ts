import loadTemplate from "./load-template.ts";
import defaultTemplate from "./template.js";
import type { HeadmarkContext, HeadmarkTemplate } from "./types.js";

/**
 * 加载模板函数。
 */
export async function resolveTemplate(template?: string): Promise<HeadmarkTemplate> {
  return template ? loadTemplate(template) : defaultTemplate;
}

/**
 * 渲染文件头部内容。
 */
export async function renderBanner(
  template: HeadmarkTemplate,
  context: HeadmarkContext,
): Promise<string> {
  const output = await template(context);

  if (typeof output !== "string") {
    throw new TypeError("Failed to render banner template.");
  }

  return output;
}

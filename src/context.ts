import { basename, extname, relative, resolve, sep } from "node:path";

import type { PackageJson } from "pkg-types";

import type { FileInfo, TemplateContext } from "./types.js";

/**
 * 构造当前文件的模板上下文。
 */
export function createContext(
  packageMetadata: PackageJson,
  filePath: string,
  cwd: string,
): TemplateContext {
  const absolutePath = resolve(cwd, filePath);
  const relativePath = relative(cwd, absolutePath);
  const fileName = basename(absolutePath);
  const extension = extname(fileName);

  const file: FileInfo = {
    path: relativePath.split(sep).join("/"),
    name: fileName,
    basename: fileName.slice(0, fileName.length - extension.length),
    ext: extension,
  };

  return {
    package: packageMetadata,
    year: new Date().getFullYear(),
    file,
  };
}

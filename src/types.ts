import type { PackageJson } from "pkg-types";

/**
 * 当前处理文件的信息。
 */
export interface FileContext {
  /** 相对于运行目录的文件路径 */
  path: string;

  /** 文件名，包含扩展名 */
  name: string;

  /** 不包含扩展名的文件名 */
  basename: string;

  /** 文件扩展名，例如 .js、.css */
  ext: string;
}

/**
 * 自定义banner模板使用的上下文。
 */
export interface HeadmarkContext {
  /** 项目元数据 */
  package: PackageJson;

  /** 当前年份 */
  year: number;

  /** 当前处理的文件 */
  file: FileContext;

  startYear?: number;

  contributors?: string[];
}

export type DefineTemplate<TContext = HeadmarkContext> = (
  context: TContext,
) => string | Promise<string>;

export interface HeadmarkOptions {
  /**
   * 工作目录，默认为当前进程的工作目录。
   */
  cwd?: string;

  /**
   * 自定义banner模板文件路径，比如：banner.ts banner.mjs等
   */
  template?: string;

  /**
   * 排除的文件或目录 Glob 模式
   */
  exclude?: string[];

  /**
   * 仅预览，不写入文件
   */
  dryRun?: boolean;
}

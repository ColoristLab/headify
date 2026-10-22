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
 * Eta 模板使用的上下文。
 */
export interface HeadmarkContext {
  /** 项目元数据 */
  package: PackageJson;

  /** 当前年份 */
  year: number;

  /** 当前处理的文件 */
  file: FileContext;
}

/**
 * headnote 的公共调用选项。
 */
export interface HeadmarkOptions {
  /** 自定义 Eta 模板文件路径 */
  template?: string;

  /** 排除的文件或目录 Glob 模式 */
  exclude?: string[];

  /** 仅预览，不写入文件 */
  dryRun?: boolean;
}

/**
 * 文件处理结果。
 */
export type FileAction = "updated" | "unchanged" | "dry-run";

/**
 * 单个文件的处理结果。
 */
export interface FileResult {
  file: string;
  action: FileAction;
}

/**
 * 整次执行的结果。
 */
export interface HeadmarkResult {
  files: FileResult[];
  updated: number;
  unchanged: number;
  dryRun: number;
}

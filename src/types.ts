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
}

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

export type FileStatus = "updated" | "unchanged" | "wouldUpdate";

/**
 * 单个文件的处理结果。
 */
export interface HeadmarkFileResult {
  /** 相对于工作目录的文件路径，统一使用 / */
  path: string;

  /** 文件处理状态 */
  status: FileStatus;
}

/**
 * 一次 headmark 任务的执行结果。
 */
export interface HeadmarkResult {
  /** 使用的模板路径，空字符串表示默认模板 */
  template: string;

  /** 是否为预览模式 */
  dryRun: boolean;

  /** 匹配到的文件总数 */
  total: number;

  /** 实际更新的文件数 */
  updated: number;

  /** 已存在相同 banner、无需修改的文件数 */
  unchanged: number;

  /** 预览模式下预计更新的文件数 */
  wouldUpdate: number;

  /** 本次任务的总耗时，单位毫秒 */
  elapsed: number;

  /** 每个文件的处理结果 */
  files: HeadmarkFileResult[];
}

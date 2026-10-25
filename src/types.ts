import type { PackageJson } from "pkg-types";

/**
 * 当前处理文件的信息。
 */
export interface FileInfo {
  /** 相对于工作目录的文件路径 */
  path: string;

  /** 文件名，包含扩展名 */
  name: string;

  /** 不包含扩展名的文件名 */
  basename: string;

  /** 文件扩展名，例如 .js、.css */
  ext: string;
}

/**
 * 自定义 banner 模板使用的上下文。
 */
export interface TemplateContext {
  /** 项目元数据 */
  package: PackageJson;

  /** 当前年份 */
  year: number;

  /** 当前处理的文件 */
  file: FileInfo;

  /** 起始年份 */
  startYear?: number;
}

/**
 * headify 的运行配置。
 */
export interface HeadifyOptions {
  /**
   * 工作目录，默认为当前进程的工作目录。
   */
  cwd?: string;

  /**
   * 自定义 banner 模板文件路径，例如 banner.ts、banner.mjs。
   */
  template?: string;

  /**
   * 排除的文件或目录 Glob 模式。
   */
  exclude?: string[];

  /**
   * 仅预览，不写入文件。
   */
  dryRun?: boolean;
}

export type FileStatus = "updated" | "unchanged" | "wouldUpdate";

/**
 * 单个文件的处理结果。
 */
export interface FileResult {
  /** 相对于工作目录的文件路径，统一使用 / */
  path: string;

  /** 文件处理状态 */
  status: FileStatus;
}

/**
 * 一次 headify 任务的执行结果。
 */
export interface HeadifyResult {
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
  files: FileResult[];
}

/**
 * 用户自定义 banner 模板函数。
 *
 * @param context - 当前模板的上下文信息。
 * @returns 生成的文件横幅字符串，支持同步或异步返回。
 */
export type BannerTemplate = (context: TemplateContext) => string | Promise<string>;

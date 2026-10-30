import { styleText } from "node:util";

type LogMethod = (...messages: unknown[]) => void;
type LogColor = Parameters<typeof styleText>[0];
type InspectColor = Exclude<LogColor, readonly unknown[]>;

export const colors = {
  info: "cyan",
  success: "green",
  muted: "gray",
  warn: "yellow",
} as const satisfies Record<string, InspectColor>;

/**
 * 格式化带背景色的标签。
 */
function formatLabel(label: string, background: InspectColor): string {
  return styleText(["black", "bold", background], ` ${label} `);
}

/**
 * 将未知类型的值转换为字符串。
 */
function stringify(value: unknown): string {
  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return String(value);
  } catch {
    return "[Unprintable value]";
  }
}

/**
 * 移除文件 URL 的协议前缀。
 *
 * 例如：
 * file:///C:/project/src/index.ts:10:20
 * -> C:/project/src/index.ts:10:20
 */
function normalizeStackLocation(location: string): string {
  return location.replace(/^file:\/\//, "");
}

/**
 * 格式化错误堆栈行。
 *
 * - 只有 `at` 使用灰色。
 * - 函数名和其他普通文本使用终端默认颜色。
 * - 文件路径及行列号使用青色。
 * - 移除 file:/// 前缀。
 * - 原始缩进减少两个空格。
 */
function formatStackLine(line: string): string {
  const trimmed = line.trimStart();
  const originalIndent = line.slice(0, line.length - trimmed.length);

  // 将原始缩进减少两个空格，最少保留零个空格。
  const indent = originalIndent.slice(0, Math.max(0, originalIndent.length - 2));

  const frame = trimmed.match(/^(at)(\s+)(.*)$/);

  if (!frame) {
    return indent + styleText(colors.muted, trimmed);
  }

  const prefix = frame[1]!;
  const separator = frame[2]!;
  const content = frame[3]!;

  // at functionName (file:///path/file.mjs:10:20)
  const parenthesized = content.match(/^(.*?)\s+\((.+)\)$/);

  if (parenthesized) {
    const method = parenthesized[1]!;
    const rawLocation = parenthesized[2]!;

    const location = normalizeStackLocation(rawLocation);

    return (
      indent +
      styleText(colors.muted, prefix) +
      separator +
      method +
      " (" +
      styleText(colors.muted, location) +
      ")"
    );
  }

  // at file:///path/file.mjs:10:20
  // at async node:internal/modules/esm/loader:646:26
  const plainLocation = content.match(/^(.*?)(:\d+(?::\d+)?)$/);

  if (plainLocation) {
    const rawFile = plainLocation[1]!;
    const position = plainLocation[2]!;

    const file = normalizeStackLocation(rawFile);

    // async 等前缀保持默认颜色，仅路径和行列号使用青色。
    const asyncPrefix = file.match(/^(async\s+)(.+)$/);

    if (asyncPrefix) {
      const [, asyncText, actualFile] = asyncPrefix;

      return (
        indent +
        styleText(colors.muted, prefix) +
        separator +
        asyncText +
        styleText(colors.muted, actualFile + position)
      );
    }

    return (
      indent +
      styleText(colors.muted, prefix) +
      separator +
      styleText(colors.muted, file + position)
    );
  }

  // 无法识别的堆栈格式：只将 at 设置为灰色。
  return indent + styleText(colors.muted, prefix) + separator + content;
}

/**
 * 格式化错误堆栈，支持递归处理 Error.cause。
 */
function formatError(error: Error, level = 0): string[] {
  const lines: string[] = [];
  const indent = "  ".repeat(level);

  if (level > 0) {
    lines.push(`${indent}${styleText("yellow", "Caused by:")} ${error.name}: ${error.message}`);
  }

  if (error.stack) {
    const stackLines = error.stack.split("\n").slice(1);

    for (const line of stackLines) {
      lines.push(`${indent}${formatStackLine(line)}`);
    }
  }

  if (error.cause instanceof Error) {
    if (lines.length > 0) {
      lines.push("");
    }

    lines.push(...formatError(error.cause, level + 1));
  }

  return lines;
}

/**
 * 输出上下各带一行空行的日志。
 */
function writeSpaced(callback: () => void): void {
  console.log();
  callback();
  console.log();
}

/**
 * 创建普通日志方法。
 */
function write(label: string, color: InspectColor): LogMethod {
  return (...messages) => {
    console.log(`${styleText(color, label)} ${messages.map(stringify).join(" ")}`);
  };
}

/**
 * 创建带背景色标签的警告日志方法。
 */
function writeBadge(label: string, background: InspectColor): LogMethod {
  return (...messages) => {
    writeSpaced(() => {
      console.warn(`${formatLabel(label, background)} ${messages.map(stringify).join(" ")}`);
    });
  };
}

/**
 * 创建错误日志方法。
 */
function writeError(): LogMethod {
  return (...messages) => {
    writeSpaced(() => {
      for (const message of messages) {
        if (!(message instanceof Error)) {
          console.error(`${formatLabel("ERROR", "bgRed")} ${stringify(message)}`);
          continue;
        }

        // 输出错误提示。
        console.error(`${formatLabel("ERROR", "bgRed")} ${message.message}`);

        // 格式化错误堆栈。
        const stack = formatError(message);

        if (stack.length > 0) {
          // 错误提示与堆栈之间保留一行空行。
          console.error();
          console.error(stack.join("\n"));
        }
      }
    });
  };
}

export const logger = {
  log: (...messages: unknown[]) => console.log(...messages),

  info: write("ℹ", colors.info),

  success: write("✔", colors.success),

  warn: writeBadge("WARN", "bgYellow"),

  error: writeError(),
};

import { logger } from "./logger.ts";

/**
 * Headify 错误代码。
 */
export type HeadifyErrorCode = "PACKAGE_NOT_FOUND" | "PACKAGE_INVALID";

/**
 * Headify 基础错误类。
 */
export class HeadifyError extends Error {
  readonly code: HeadifyErrorCode;

  constructor(message: string, code: HeadifyErrorCode, options?: ErrorOptions) {
    super(message, options);

    this.name = "HeadifyError";
    this.code = code;
  }
}

/**
 * 统一处理 CLI 异常。
 */
export function handleError(error: unknown): void {
  if (error instanceof HeadifyError) {
    logger.error(error.message);
  } else if (error instanceof Error) {
    logger.error(`Unexpected error: ${error.message}`);
  } else {
    logger.error("An unknown error occurred.");
  }
  process.exitCode = 1;
}

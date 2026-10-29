import { afterEach, describe, expect, it, vi } from "vitest";

import { logger } from "../src/logger.ts";
import { reportResult } from "../src/reporter.ts";

describe("reportResult", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("没有匹配文件时发出警告并返回", () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
    const info = vi.spyOn(logger, "info").mockImplementation(() => {});
    const success = vi.spyOn(logger, "success").mockImplementation(() => {});

    reportResult("1.0.0", {
      template: "",
      dryRun: false,
      total: 0,
      updated: 0,
      unchanged: 0,
      wouldUpdate: 0,
      elapsed: 1,
      files: [],
    });

    expect(warn).toHaveBeenCalledWith("No files matched the specified patterns.");
    expect(info).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
  });

  it("报告正常运行的总数和文件状态", () => {
    const info = vi.spyOn(logger, "info").mockImplementation(() => {});
    const success = vi.spyOn(logger, "success").mockImplementation(() => {});

    reportResult("1.2.3", {
      template: "",
      dryRun: false,
      total: 2,
      updated: 1,
      unchanged: 1,
      wouldUpdate: 0,
      elapsed: 12,
      files: [
        { path: "src/index.ts", status: "updated" },
        { path: "src/other.ts", status: "unchanged" },
      ],
    });

    expect(info).toHaveBeenCalledWith("headify v1.2.3");
    expect(info).toHaveBeenCalledWith("Matched 2 files");
    expect(info).toHaveBeenCalledWith("Template: default");
    expect(info).toHaveBeenCalledWith("Updated: 1 Unchanged: 1");
    expect(info).toHaveBeenCalledWith(expect.stringContaining("src/index.ts"));
    expect(info).toHaveBeenCalledWith(expect.stringContaining("src/other.ts"));
    expect(success).toHaveBeenCalledWith(expect.stringContaining("Completed in"));
  });

  it("报告试运行模式及预计更新的文件数量", () => {
    const info = vi.spyOn(logger, "info").mockImplementation(() => {});

    reportResult("1.2.3", {
      template: "banner.mjs",
      dryRun: true,
      total: 1,
      updated: 0,
      unchanged: 0,
      wouldUpdate: 1,
      elapsed: 4,
      files: [{ path: "src/index.ts", status: "wouldUpdate" }],
    });

    expect(info).toHaveBeenCalledWith("Template: banner.mjs");
    expect(info).toHaveBeenCalledWith("Dry run: no files will be modified");
    expect(info).toHaveBeenCalledWith("Would update: 1 Unchanged: 0");
  });

  it("正确报告不包含目录的文件路径", () => {
    const info = vi.spyOn(logger, "info").mockImplementation(() => {});

    reportResult("1.2.3", {
      template: "",
      dryRun: false,
      total: 1,
      updated: 1,
      unchanged: 0,
      wouldUpdate: 0,
      elapsed: 1,
      files: [{ path: "index.ts", status: "updated" }],
    });

    expect(info).toHaveBeenCalledWith("index.ts");
  });
});

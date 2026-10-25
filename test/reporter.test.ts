import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "../src/logger.js";
import { reportResult } from "../src/reporter.js";

describe("reportResult", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("warns and returns when no files matched", () => {
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

  it("reports normal run totals and file statuses", () => {
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

    expect(info).toHaveBeenCalledWith("headmark v1.2.3");
    expect(info).toHaveBeenCalledWith("Matched 2 files");
    expect(info).toHaveBeenCalledWith("Template: default");
    expect(info).toHaveBeenCalledWith("Updated: 1 Unchanged: 1");
    expect(info).toHaveBeenCalledWith(expect.stringContaining("src/index.ts"));
    expect(info).toHaveBeenCalledWith(expect.stringContaining("src/other.ts"));
    expect(success).toHaveBeenCalledWith(expect.stringContaining("Completed in"));
  });

  it("reports dry-run mode and would-update totals", () => {
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
});

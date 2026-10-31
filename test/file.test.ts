import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HeadifyError } from "../src/errors.ts";
import { findFiles, hasBanner, prependBanner, loadPackage } from "../src/file.ts";
import { createTempDir } from "./helpers.ts";
let cwd: string;

beforeEach(async () => {
  cwd = await createTempDir("headify-file-test-");
});

afterEach(async () => {
  if (cwd) await rm(cwd, { recursive: true, force: true });
});

describe("findFiles", () => {
  it("查找匹配的普通文件", async () => {
    await mkdir(join(cwd, "src"), { recursive: true });
    await writeFile(join(cwd, "src", "a.ts"), "a");
    await writeFile(join(cwd, "src", "b.ts"), "b");
    await writeFile(join(cwd, "src", "c.js"), "c");

    const files = await findFiles(["src/*.ts"], { cwd: cwd, exclude: [] });

    expect(files).toHaveLength(2);
    expect(files).toEqual(
      expect.arrayContaining([join(cwd, "src", "a.ts"), join(cwd, "src", "b.ts")]),
    );
  });

  it("支持多个 glob 匹配模式，且不会产生重复结果", async () => {
    await writeFile(join(cwd, "a.ts"), "a");
    await writeFile(join(cwd, "b.ts"), "b");

    const files = await findFiles(["*.ts", "a.ts"], { cwd: cwd, exclude: [] });

    expect(files).toHaveLength(2);
  });

  it("遵循排除匹配模式", async () => {
    await mkdir(join(cwd, "dist"), { recursive: true });
    await writeFile(join(cwd, "src.ts"), "src");
    await writeFile(join(cwd, "dist", "bundle.js"), "dist");

    const files = await findFiles(["**/*"], {
      cwd: cwd,
      exclude: ["dist/**", "package.json"],
    });

    expect(files).toEqual([join(cwd, "src.ts")]);
  });

  it("没有匹配项时返回空数组", async () => {
    await expect(findFiles(["missing/**/*.ts"], { cwd: cwd, exclude: [] })).resolves.toEqual([]);
  });
});

describe("hasBanner", () => {
  it("横幅位于文件开头时返回 true", async () => {
    const file = join(cwd, "a.ts");
    await writeFile(file, "/* banner */\nconst value = 1;\n");

    await expect(hasBanner(file, "/* banner */")).resolves.toBe(true);
  });

  it("支持横幅后使用 CRLF 换行符", async () => {
    const file = join(cwd, "a.ts");
    await writeFile(file, "/* banner */\r\nconst value = 1;\r\n");

    await expect(hasBanner(file, "/* banner */\n\n")).resolves.toBe(true);
  });

  it("横幅出现在文件后续位置时返回 false", async () => {
    const file = join(cwd, "a.ts");
    await writeFile(file, "const value = 1;\n/* banner */");

    await expect(hasBanner(file, "/* banner */")).resolves.toBe(false);
  });

  it("不会将更长的前缀误判为相同的横幅", async () => {
    const file = join(cwd, "a.ts");
    await writeFile(file, "/* banner */ extra\ncontent");

    await expect(hasBanner(file, "/* banner */")).resolves.toBe(false);
  });
});

describe("prependBanner", () => {
  it("在文件开头添加横幅并保留原有内容", async () => {
    const file = join(cwd, "a.ts");
    await writeFile(file, "const value = 1;\n");

    await expect(prependBanner(file, "/* banner */\n")).resolves.toBe(true);
    await expect(readFile(file, "utf8")).resolves.toBe("/* banner */\nconst value = 1;\n");
  });

  it("文件开头已存在相同横幅时不做修改", async () => {
    const file = join(cwd, "a.ts");
    const original = "/* banner */\nconst value = 1;\n";
    await writeFile(file, original);

    await expect(prependBanner(file, "/* banner */\n\n")).resolves.toBe(false);
    await expect(readFile(file, "utf8")).resolves.toBe(original);
  });

  it("原文件为空时仅写入横幅", async () => {
    const file = join(cwd, "empty.ts");
    await writeFile(file, "");

    await expect(prependBanner(file, "/* banner */\n")).resolves.toBe(true);
    await expect(readFile(file, "utf8")).resolves.toBe("/* banner */");
  });

  it("目标文件不存在时抛出异常", async () => {
    await expect(prependBanner(join(cwd, "missing.ts"), "/* banner */")).rejects.toThrow();
  });
});

describe("loadPackage", () => {
  it("成功读取并解析 package.json", async () => {
    const packageMetadata = {
      name: "test-project",
      version: "1.0.0",
      homepage: "https://example.com",
      author: "Test Author",
      license: "MIT",
    };

    await writeFile(join(cwd, "package.json"), JSON.stringify(packageMetadata), "utf8");

    await expect(loadPackage(cwd)).resolves.toEqual(packageMetadata);
  });

  it("package.json 不存在时抛出 PACKAGE_NOT_FOUND 错误", async () => {
    await expect(loadPackage(cwd)).rejects.toMatchObject({
      name: "HeadifyError",
      code: "PACKAGE_NOT_FOUND",
      message: `Cannot find package.json in "${cwd}".`,
      cause: expect.objectContaining({
        code: "ENOENT",
      }),
    });
  });

  it("HeadifyError 应保留原始异常作为 cause", async () => {
    await writeFile(join(cwd, "package.json"), "{ invalid json }", "utf8");

    try {
      await loadPackage(cwd);
      expect.fail("Expected loadPackage to throw.");
    } catch (error) {
      expect(error).toBeInstanceOf(HeadifyError);

      if (error instanceof HeadifyError) {
        expect(error.code).toBe("PACKAGE_INVALID");
        expect(error.cause).toBeInstanceOf(SyntaxError);
      }
    }
  });

  it("读取 package.json 遇到其他错误时应重新抛出原始错误", async () => {
    await mkdir(join(cwd, "package.json"));

    await expect(loadPackage(cwd)).rejects.toSatisfy(
      (error) =>
        error instanceof Error &&
        "code" in error &&
        error.code !== "ENOENT" &&
        !(error instanceof HeadifyError),
    );
  });

  it("解析 package.json 遇到非 SyntaxError 时应重新抛出原始错误", async () => {
    const originalError = new TypeError("Unexpected error");

    await writeFile(join(cwd, "package.json"), "{}", "utf8");

    // 让 JSON.parse() 抛出一个非 SyntaxError 的异常
    const parseSpy = vi.spyOn(JSON, "parse").mockImplementation(() => {
      throw originalError;
    });

    try {
      // 使用rejects.toBe而非.rejects.toThrow()，为了验证抛出的就是原始异常对象
      await expect(loadPackage(cwd)).rejects.toBe(originalError);
    } finally {
      parseSpy.mockRestore();
    }
  });
});

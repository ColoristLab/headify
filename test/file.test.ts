import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { findFiles, hasBanner, prependBanner } from "../src/file.js";

let cwd: string;

async function setup() {
  cwd = await mkdtemp(join(tmpdir(), "headify-file-test-"));
  return cwd;
}

afterEach(async () => {
  if (cwd) await rm(cwd, { recursive: true, force: true });
});

describe("findFiles", () => {
  it("查找匹配的普通文件", async () => {
    const root = await setup();
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "src", "a.ts"), "a");
    await writeFile(join(root, "src", "b.ts"), "b");
    await writeFile(join(root, "src", "c.js"), "c");

    const files = await findFiles(["src/*.ts"], { cwd: root, exclude: [] });

    expect(files).toHaveLength(2);
    expect(files).toEqual(
      expect.arrayContaining([join(root, "src", "a.ts"), join(root, "src", "b.ts")]),
    );
  });

  it("支持多个 glob 匹配模式，且不会产生重复结果", async () => {
    const root = await setup();
    await writeFile(join(root, "a.ts"), "a");
    await writeFile(join(root, "b.ts"), "b");

    const files = await findFiles(["*.ts", "a.ts"], { cwd: root, exclude: [] });

    expect(files).toHaveLength(2);
  });

  it("遵循排除匹配模式", async () => {
    const root = await setup();
    await mkdir(join(root, "dist"), { recursive: true });
    await writeFile(join(root, "src.ts"), "src");
    await writeFile(join(root, "dist", "bundle.js"), "dist");

    const files = await findFiles(["**/*"], {
      cwd: root,
      exclude: ["dist/**", "package.json"],
    });

    expect(files).toEqual([join(root, "src.ts")]);
  });

  it("没有匹配项时返回空数组", async () => {
    const root = await setup();

    await expect(findFiles(["missing/**/*.ts"], { cwd: root, exclude: [] })).resolves.toEqual([]);
  });
});

describe("hasBanner", () => {
  it("横幅位于文件开头时返回 true", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    await writeFile(file, "/* banner */\nconst value = 1;\n");

    await expect(hasBanner(file, "/* banner */")).resolves.toBe(true);
  });

  it("支持横幅后使用 CRLF 换行符", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    await writeFile(file, "/* banner */\r\nconst value = 1;\r\n");

    await expect(hasBanner(file, "/* banner */\n\n")).resolves.toBe(true);
  });

  it("横幅出现在文件后续位置时返回 false", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    await writeFile(file, "const value = 1;\n/* banner */");

    await expect(hasBanner(file, "/* banner */")).resolves.toBe(false);
  });

  it("不会将更长的前缀误判为相同的横幅", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    await writeFile(file, "/* banner */ extra\ncontent");

    await expect(hasBanner(file, "/* banner */")).resolves.toBe(false);
  });
});

describe("prependBanner", () => {
  it("在文件开头添加横幅并保留原有内容", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    await writeFile(file, "const value = 1;\n");

    await expect(prependBanner(file, "/* banner */\n")).resolves.toBe(true);
    await expect(readFile(file, "utf8")).resolves.toBe("/* banner */\nconst value = 1;\n");
  });

  it("文件开头已存在相同横幅时不做修改", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    const original = "/* banner */\nconst value = 1;\n";
    await writeFile(file, original);

    await expect(prependBanner(file, "/* banner */\n\n")).resolves.toBe(false);
    await expect(readFile(file, "utf8")).resolves.toBe(original);
  });

  it("原文件为空时仅写入横幅", async () => {
    const root = await setup();
    const file = join(root, "empty.ts");
    await writeFile(file, "");

    await expect(prependBanner(file, "/* banner */\n")).resolves.toBe(true);
    await expect(readFile(file, "utf8")).resolves.toBe("/* banner */");
  });

  it("目标文件不存在时抛出异常", async () => {
    const root = await setup();

    await expect(prependBanner(join(root, "missing.ts"), "/* banner */")).rejects.toThrow();
  });
});

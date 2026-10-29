import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { headify } from "../src/headify.ts";
import { createProject } from "./helpers.ts";

describe("headify", () => {
  let project: Awaited<ReturnType<typeof createProject>> | undefined;

  afterEach(async () => {
    vi.restoreAllMocks();
    await project?.cleanup();
    project = undefined;
  });

  it("没有匹配文件时返回空结果，并跳过 package.json 的加载", async () => {
    project = await createProject();

    const result = await headify(["missing/**/*.ts"], { cwd: project.cwd });

    expect(result).toMatchObject({
      template: "",
      dryRun: false,
      total: 0,
      updated: 0,
      unchanged: 0,
      wouldUpdate: 0,
      files: [],
    });
  });

  it("为匹配的文件添加横幅并返回汇总计数", async () => {
    project = await createProject();
    await project.writeFile("src/index.ts", "export const value = 1;\n");
    await project.writeFile("src/other.ts", "export const other = 2;\n");

    const result = await headify(["src/**/*.ts"], {
      cwd: project.cwd,
      template: "",
    });

    expect(result.total).toBe(2);
    expect(result.updated).toBe(2);
    expect(result.unchanged).toBe(0);
    expect(result.wouldUpdate).toBe(0);
    expect(result.files).toEqual(
      expect.arrayContaining([
        { path: "src/index.ts", status: "updated" },
        { path: "src/other.ts", status: "updated" },
      ]),
    );
    expect(await project.readFile("src/index.ts")).toContain("export const value = 1;");
    expect(await project.readFile("src/index.ts")).toMatch(/^\/\*!/);
  });

  it("重复运行时不会添加重复横幅", async () => {
    project = await createProject();
    await project.writeFile("src/index.ts", "export const value = 1;\n");

    const options = { cwd: project.cwd, template: "" };
    const first = await headify(["src/index.ts"], options);
    const contentAfterFirstRun = await project.readFile("src/index.ts");
    const second = await headify(["src/index.ts"], options);

    expect(first.updated).toBe(1);
    expect(second.updated).toBe(0);
    expect(second.unchanged).toBe(1);
    expect(await project.readFile("src/index.ts")).toBe(contentAfterFirstRun);
  });

  it("排除符合排除模式的文件", async () => {
    project = await createProject();
    await project.writeFile("src/index.ts", "index\n");
    await project.writeFile("dist/bundle.js", "bundle\n");

    const result = await headify(["**/*"], {
      cwd: project.cwd,
      exclude: ["dist/**", "package.json"],
      template: "",
    });

    expect(result.files.map((file) => file.path)).toEqual(["src/index.ts"]);
    expect(await project.readFile("dist/bundle.js")).toBe("bundle\n");
  });

  it("试运行模式会报告需要修改的文件，但不会写入文件", async () => {
    project = await createProject();
    const original = "export const value = 1;\n";
    await project.writeFile("src/index.ts", original);

    const result = await headify(["src/index.ts"], {
      cwd: project.cwd,
      dryRun: true,
      template: "",
    });

    expect(result.dryRun).toBe(true);
    expect(result.updated).toBe(0);
    expect(result.wouldUpdate).toBe(1);
    expect(result.unchanged).toBe(0);
    expect(result.files).toEqual([{ path: "src/index.ts", status: "wouldUpdate" }]);
    expect(await project.readFile("src/index.ts")).toBe(original);
  });

  it("试运行模式会将已有横幅的文件报告为未更改", async () => {
    project = await createProject();
    await project.writeFile("src/index.ts", "/* custom */\nsource\n");
    await project.writeFile("template.mjs", "export default () => '/* custom */';");

    const result = await headify(["src/index.ts"], {
      cwd: project.cwd,
      template: join(project.cwd, "template.mjs"),
      dryRun: true,
    });

    expect(result.wouldUpdate).toBe(0);
    expect(result.unchanged).toBe(1);
  });

  it("验证匹配模式和选项类型", async () => {
    project = await createProject();

    await expect(headify("src/*.ts" as never, { cwd: project.cwd })).rejects.toThrow(
      "Expected patterns to be an array of strings.",
    );
    await expect(headify([], { cwd: 123 as never })).rejects.toThrow(
      'Expected "cwd" to be a string.',
    );
    await expect(headify([], { cwd: project.cwd, template: 123 as never })).rejects.toThrow(
      'Expected "template" to be a string.',
    );
    await expect(headify([], { cwd: project.cwd, exclude: "dist/**" as never })).rejects.toThrow(
      'Expected "exclude" to be an array of strings.',
    );
    await expect(headify([], { cwd: project.cwd, dryRun: "yes" as never })).rejects.toThrow(
      'Expected "dryRun" to be a boolean.',
    );
  });

  it("存在匹配文件但缺少 package.json 时拒绝执行", async () => {
    project = await createProject();
    await project.writeFile("src/index.ts", "source\n");
    // createProject 会创建 package.json，因此需要通过文件系统辅助工具的根目录将其删除。
    const { rm } = await import("node:fs/promises");

    await rm(join(project.cwd, "package.json"));

    await expect(headify(["src/index.ts"], { cwd: project.cwd })).rejects.toThrow();
  });
});

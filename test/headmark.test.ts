import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { headmark } from "../src/headmark.js";
import { createProject } from "./helpers.js";

describe("headmark", () => {
  let project: Awaited<ReturnType<typeof createProject>> | undefined;

  afterEach(async () => {
    vi.restoreAllMocks();
    await project?.cleanup();
    project = undefined;
  });

  it("returns an empty result and skips package.json loading when no files match", async () => {
    project = await createProject();

    const result = await headmark(["missing/**/*.ts"], { cwd: project.cwd });

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

  it("prepends a banner to matching files and returns summary counts", async () => {
    project = await createProject();
    await project.writeFile("src/index.ts", "export const value = 1;\n");
    await project.writeFile("src/other.ts", "export const other = 2;\n");

    const result = await headmark(["src/**/*.ts"], {
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

  it("does not add a duplicate banner when run more than once", async () => {
    project = await createProject();
    await project.writeFile("src/index.ts", "export const value = 1;\n");

    const options = { cwd: project.cwd, template: "" };
    const first = await headmark(["src/index.ts"], options);
    const contentAfterFirstRun = await project.readFile("src/index.ts");
    const second = await headmark(["src/index.ts"], options);

    expect(first.updated).toBe(1);
    expect(second.updated).toBe(0);
    expect(second.unchanged).toBe(1);
    expect(await project.readFile("src/index.ts")).toBe(contentAfterFirstRun);
  });

  it("excludes files matching exclude patterns", async () => {
    project = await createProject();
    await project.writeFile("src/index.ts", "index\n");
    await project.writeFile("dist/bundle.js", "bundle\n");

    const result = await headmark(["**/*"], {
      cwd: project.cwd,
      exclude: ["dist/**", "package.json"],
      template: "",
    });

    expect(result.files.map((file) => file.path)).toEqual(["src/index.ts"]);
    expect(await project.readFile("dist/bundle.js")).toBe("bundle\n");
  });

  it("dry-run reports files that would change without writing", async () => {
    project = await createProject();
    const original = "export const value = 1;\n";
    await project.writeFile("src/index.ts", original);

    const result = await headmark(["src/index.ts"], {
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

  it("dry-run reports an existing banner as unchanged", async () => {
    project = await createProject();
    await project.writeFile("src/index.ts", "/* custom */\nsource\n");
    await project.writeFile("template.mjs", "export default () => '/* custom */';");

    const result = await headmark(["src/index.ts"], {
      cwd: project.cwd,
      template: join(project.cwd, "template.mjs"),
      dryRun: true,
    });

    expect(result.wouldUpdate).toBe(0);
    expect(result.unchanged).toBe(1);
  });

  // it("uses the custom template and provides file/package context", async () => {
  //   project = await createProject();
  //   await project.writeFile("src/index.ts", "source\n");
  //   await project.writeFile(
  //     "banner.mjs",
  //     "export default (ctx) => `// ${ctx.package.name}@${ctx.package.version} | ${ctx.file.path} | ${ctx.file.basename}${ctx.file.ext}`;",
  //   );

  //   const result = await headmark(["src/index.ts"], {
  //     cwd: project.cwd,
  //     template: join(project.cwd, "banner.mjs"),
  //   });

  //   expect(result.template).toBe("banner.mjs");
  //   expect(await project.readFile("src/index.ts"))
  //     .toMatch(/^\/\/ test-project@1\.2\.3 \| src\/index\.ts \| index\.ts\nsource\n$/);
  // });

  it("validates patterns and option types", async () => {
    project = await createProject();

    await expect(headmark("src/*.ts" as never, { cwd: project.cwd })).rejects.toThrow(
      "Expected patterns to be an array of strings.",
    );
    await expect(headmark([], { cwd: 123 as never })).rejects.toThrow(
      'Expected "cwd" to be a string.',
    );
    await expect(headmark([], { cwd: project.cwd, template: 123 as never })).rejects.toThrow(
      'Expected "template" to be a string.',
    );
    await expect(headmark([], { cwd: project.cwd, exclude: "dist/**" as never })).rejects.toThrow(
      'Expected "exclude" to be an array of strings.',
    );
    await expect(headmark([], { cwd: project.cwd, dryRun: "yes" as never })).rejects.toThrow(
      'Expected "dryRun" to be a boolean.',
    );
  });

  it("rejects when package.json is missing for a non-empty match", async () => {
    project = await createProject();
    await project.writeFile("src/index.ts", "source\n");
    // createProject creates package.json, so remove it through the filesystem helper's root.
    const { rm } = await import("node:fs/promises");
    const { join } = await import("node:path");
    await rm(join(project.cwd, "package.json"));

    await expect(headmark(["src/index.ts"], { cwd: project.cwd })).rejects.toThrow();
  });
});

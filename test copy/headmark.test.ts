import { mkdtemp, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { headmark, defaultOptions } from "../src/headmark.ts";

describe("headmark", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "headmark-run-"));
    await writeFile(
      join(dir, "package.json"),
      JSON.stringify({
        name: "test-pkg",
        version: "1.0.0",
        homepage: "https://example.com",
        author: "Author",
        license: "MIT",
      }),
    );
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("exposes defaultOptions", () => {
    expect(defaultOptions.template).toBe("");
    expect(defaultOptions.exclude).toEqual([]);
    expect(defaultOptions.dryRun).toBe(false);
  });

  it("returns an empty result when nothing matches", async () => {
    const result = await headmark([], { cwd: dir });
    expect(result.total).toBe(0);
    expect(result.files).toEqual([]);
    expect(result.elapsed).toBeGreaterThanOrEqual(0);
  });

  it("prepends the default banner to matched files", async () => {
    await writeFile(join(dir, "a.ts"), "console.log(1);\n");
    const result = await headmark(["*.ts"], { cwd: dir });

    expect(result.total).toBe(1);
    expect(result.updated).toBe(1);
    expect(result.unchanged).toBe(0);
    expect(result.files[0]!.status).toBe("updated");

    const content = await readFile(join(dir, "a.ts"), "utf8");
    expect(content).toContain("test-pkg v1.0.0");
    expect(content).toContain("console.log(1);");
  });

  it("reports unchanged when banner already exists", async () => {
    await writeFile(join(dir, "a.ts"), "code");
    await headmark(["*.ts"], { cwd: dir });
    const result = await headmark(["*.ts"], { cwd: dir });

    expect(result.updated).toBe(0);
    expect(result.unchanged).toBe(1);
    expect(result.files[0]!.status).toBe("unchanged");
  });

  it("dry-run reports wouldUpdate without writing", async () => {
    await writeFile(join(dir, "a.ts"), "code");
    const result = await headmark(["*.ts"], { cwd: dir, dryRun: true });

    expect(result.wouldUpdate).toBe(1);
    expect(result.updated).toBe(0);
    expect(result.files[0]!.status).toBe("wouldUpdate");
    expect(await readFile(join(dir, "a.ts"), "utf8")).toBe("code");
  });

  it("dry-run reports unchanged for already-bannered files", async () => {
    await writeFile(join(dir, "a.ts"), "code");
    await headmark(["*.ts"], { cwd: dir });
    const result = await headmark(["*.ts"], { cwd: dir, dryRun: true });

    expect(result.unchanged).toBe(1);
    expect(result.wouldUpdate).toBe(0);
  });

  it("respects exclude patterns", async () => {
    await writeFile(join(dir, "a.ts"), "x");
    await writeFile(join(dir, "b.ts"), "x");
    const result = await headmark(["*.ts"], { cwd: dir, exclude: ["b.ts"] });
    expect(result.total).toBe(1);
  });

  it("supports a custom template", async () => {
    await writeFile(join(dir, "a.ts"), "x");
    const tplPath = join(dir, "tpl.mjs");
    await writeFile(tplPath, `export default (ctx) => "// custom " + ctx.file.name;`);

    const result = await headmark(["*.ts"], { cwd: dir, template: tplPath });
    expect(result.template).toBe(tplPath);

    expect(await readFile(join(dir, "a.ts"), "utf8")).toBe("// custom a.ts\nx");
  });

  // ---- validateOptions ----

  it("throws for non-array patterns", async () => {
    await expect(headmark("x" as any, { cwd: dir })).rejects.toThrow(
      "Expected patterns to be an array of strings.",
    );
  });

  it("throws for non-string cwd", async () => {
    await expect(headmark(["x"], { cwd: 1 as any })).rejects.toThrow(
      'Expected "cwd" to be a string.',
    );
  });

  it("throws for non-string template", async () => {
    await expect(headmark(["x"], { cwd: dir, template: 1 as any })).rejects.toThrow(
      'Expected "template" to be a string.',
    );
  });

  it("throws for non-array exclude", async () => {
    await expect(headmark(["x"], { cwd: dir, exclude: "x" as any })).rejects.toThrow(
      'Expected "exclude" to be an array of strings.',
    );
  });

  it("throws for non-string exclude item", async () => {
    await expect(headmark(["x"], { cwd: dir, exclude: [1 as any] })).rejects.toThrow(
      'Expected "exclude" to be an array of strings.',
    );
  });

  it("throws for non-boolean dryRun", async () => {
    await expect(headmark(["x"], { cwd: dir, dryRun: "yes" as any })).rejects.toThrow(
      'Expected "dryRun" to be a boolean.',
    );
  });
});

import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it, expect, beforeEach, afterEach } from "vitest";

import loadTemplate from "../src/load-template.ts";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, "fixtures");

describe("loadTemplate", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "headmark-tpl-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("loads a .mjs module", async () => {
    const f = join(dir, "tpl.mjs");
    await writeFile(f, `export default () => "mjs-banner";`);
    const tpl = await loadTemplate(f);
    expect(await tpl({} as any)).toBe("mjs-banner");
  });

  it("loads a .js module", async () => {
    const f = join(dir, "tpl.js");
    await writeFile(f, `module.exports = () => "js-banner";`);
    const tpl = await loadTemplate(f);
    expect(await tpl({} as any)).toBe("js-banner");
  });

  it("loads a .cjs module", async () => {
    const f = join(dir, "tpl.cjs");
    await writeFile(f, `module.exports = () => "cjs-banner";`);
    const tpl = await loadTemplate(f);
    expect(await tpl({} as any)).toBe("cjs-banner");
  });

  it("loads a .ts module (transformed by Vite)", async () => {
    const tpl = await loadTemplate(join(fixtures, "tpl.ts"));
    expect(
      await tpl({ file: { path: "a.ts", name: "a.ts", basename: "a", ext: ".ts" } } as any),
    ).toBe("ts:a.ts");
  });

  it("loads a .mts module", async () => {
    const tpl = await loadTemplate(join(fixtures, "tpl.mts"));
    expect(
      await tpl({ file: { path: "a.ts", name: "a.ts", basename: "a", ext: ".ts" } } as any),
    ).toBe("mts:a.ts");
  });

  it("throws on unsupported extension", async () => {
    const f = join(dir, "tpl.txt");
    await writeFile(f, "");
    await expect(loadTemplate(f)).rejects.toThrow("Unsupported template extension: .txt");
  });

  it("throws when default export is not a function", async () => {
    const f = join(dir, "bad.mjs");
    await writeFile(f, `export default "not-a-function";`);
    await expect(loadTemplate(f)).rejects.toThrow("must export a function");
  });
});

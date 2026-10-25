import { mkdtemp, writeFile, mkdir, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { findFiles, hasBanner, prependBanner } from "../src/file.ts";

describe("file helpers", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "headmark-file-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  describe("findFiles", () => {
    it("matches a single glob", async () => {
      await writeFile(join(dir, "a.ts"), "");
      await writeFile(join(dir, "b.js"), "");
      const files = await findFiles("*.ts", { cwd: dir, exclude: [] });
      expect(files).toHaveLength(1);
      expect(files[0]).toMatch(/a\.ts$/);
    });

    it("supports an array of patterns and de-duplicates", async () => {
      await writeFile(join(dir, "a.ts"), "");
      const files = await findFiles(["*.ts", "a.ts"], { cwd: dir, exclude: [] });
      expect(files).toHaveLength(1);
    });

    it("applies exclude patterns", async () => {
      await writeFile(join(dir, "a.ts"), "");
      await writeFile(join(dir, "b.ts"), "");
      const files = await findFiles("*.ts", { cwd: dir, exclude: ["b.ts"] });
      expect(files.map((f) => f.split(/[\\/]/).pop())).toEqual(["a.ts"]);
    });

    it("ignores directories", async () => {
      await mkdir(join(dir, "sub"));
      await writeFile(join(dir, "a.ts"), "");
      const files = await findFiles("*", { cwd: dir, exclude: [] });
      expect(files).toHaveLength(1);
      expect(files[0]).toMatch(/a\.ts$/);
    });
  });

  describe("hasBanner", () => {
    it("returns true when file equals banner", async () => {
      const f = join(dir, "f.ts");
      await writeFile(f, "// banner");
      expect(await hasBanner(f, "// banner")).toBe(true);
    });

    it("returns true when file starts with banner + \\n", async () => {
      const f = join(dir, "f.ts");
      await writeFile(f, "// banner\ncode");
      expect(await hasBanner(f, "// banner")).toBe(true);
    });

    it("returns true when file starts with banner + \\r\\n", async () => {
      const f = join(dir, "f.ts");
      await writeFile(f, "// banner\r\ncode");
      expect(await hasBanner(f, "// banner")).toBe(true);
    });

    it("returns false when banner is not at the start", async () => {
      const f = join(dir, "f.ts");
      await writeFile(f, "// other\n// banner");
      expect(await hasBanner(f, "// banner")).toBe(false);
    });

    it("returns false when banner is a prefix of a longer token", async () => {
      const f = join(dir, "f.ts");
      await writeFile(f, "// bannerXX");
      expect(await hasBanner(f, "// banner")).toBe(false);
    });

    it("normalizes trailing whitespace in the banner", async () => {
      const f = join(dir, "f.ts");
      await writeFile(f, "// banner\ncode");
      expect(await hasBanner(f, "// banner   \n")).toBe(true);
    });
  });

  describe("prependBanner", () => {
    it("prepends banner before existing content", async () => {
      const f = join(dir, "f.ts");
      await writeFile(f, "code");
      const changed = await prependBanner(f, "// banner");
      expect(changed).toBe(true);
      expect(await readFile(f, "utf8")).toBe("// banner\ncode");
    });

    it("prepends banner without separator on empty file", async () => {
      const f = join(dir, "f.ts");
      await writeFile(f, "");
      const changed = await prependBanner(f, "// banner");
      expect(changed).toBe(true);
      expect(await readFile(f, "utf8")).toBe("// banner");
    });

    it("returns false if the banner already exists", async () => {
      const f = join(dir, "f.ts");
      await writeFile(f, "// banner\ncode");
      const changed = await prependBanner(f, "// banner");
      expect(changed).toBe(false);
      expect(await readFile(f, "utf8")).toBe("// banner\ncode");
    });

    it("trims banner trailing whitespace", async () => {
      const f = join(dir, "f.ts");
      await writeFile(f, "code");
      await prependBanner(f, "// banner\n\n");
      expect(await readFile(f, "utf8")).toBe("// banner\ncode");
    });
  });
});

import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { findFiles, hasBanner, prependBanner } from "../src/file.js";

let cwd: string;

async function setup() {
  cwd = await mkdtemp(join(tmpdir(), "headmark-file-test-"));
  return cwd;
}

afterEach(async () => {
  if (cwd) await rm(cwd, { recursive: true, force: true });
});

describe("findFiles", () => {
  it("finds matching regular files", async () => {
    const root = await setup();
    await mkdir(join(root, "src"), { recursive: true });
    await writeFile(join(root, "src", "a.ts"), "a");
    await writeFile(join(root, "src", "b.ts"), "b");
    await writeFile(join(root, "src", "c.js"), "c");

    const files = await findFiles(["src/*.ts"], { cwd: root, exclude: [] });

    expect(files).toHaveLength(2);
    expect(files).toEqual(expect.arrayContaining([
      join(root, "src", "a.ts"),
      join(root, "src", "b.ts"),
    ]));
  });

  it("supports multiple glob patterns without duplicate results", async () => {
    const root = await setup();
    await writeFile(join(root, "a.ts"), "a");
    await writeFile(join(root, "b.ts"), "b");

    const files = await findFiles(["*.ts", "a.ts"], { cwd: root, exclude: [] });

    expect(files).toHaveLength(2);
  });

  it("honors exclude patterns", async () => {
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

  it("returns an empty array when nothing matches", async () => {
    const root = await setup();

    await expect(findFiles(["missing/**/*.ts"], { cwd: root, exclude: [] }))
      .resolves.toEqual([]);
  });
});

describe("hasBanner", () => {
  it("returns true when the banner is at the beginning of a file", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    await writeFile(file, "/* banner */\nconst value = 1;\n");

    await expect(hasBanner(file, "/* banner */")).resolves.toBe(true);
  });

  it("accepts CRLF after the banner", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    await writeFile(file, "/* banner */\r\nconst value = 1;\r\n");

    await expect(hasBanner(file, "/* banner */\n\n")).resolves.toBe(true);
  });

  it("returns false when the banner appears later in the file", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    await writeFile(file, "const value = 1;\n/* banner */");

    await expect(hasBanner(file, "/* banner */")).resolves.toBe(false);
  });

  it("does not treat a longer prefix as the same banner", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    await writeFile(file, "/* banner */ extra\ncontent");

    await expect(hasBanner(file, "/* banner */")).resolves.toBe(false);
  });
});

describe("prependBanner", () => {
  it("prepends the banner and preserves the original content", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    await writeFile(file, "const value = 1;\n");

    await expect(prependBanner(file, "/* banner */\n")).resolves.toBe(true);
    await expect(readFile(file, "utf8")).resolves.toBe("/* banner */\nconst value = 1;\n");
  });

  it("does not modify a file that already starts with the same banner", async () => {
    const root = await setup();
    const file = join(root, "a.ts");
    const original = "/* banner */\nconst value = 1;\n";
    await writeFile(file, original);

    await expect(prependBanner(file, "/* banner */\n\n")).resolves.toBe(false);
    await expect(readFile(file, "utf8")).resolves.toBe(original);
  });

  it("writes only the banner when the original file is empty", async () => {
    const root = await setup();
    const file = join(root, "empty.ts");
    await writeFile(file, "");

    await expect(prependBanner(file, "/* banner */\n")).resolves.toBe(true);
    await expect(readFile(file, "utf8")).resolves.toBe("/* banner */");
  });

  it("throws when the target file does not exist", async () => {
    const root = await setup();

    await expect(prependBanner(join(root, "missing.ts"), "/* banner */"))
      .rejects.toThrow();
  });
});

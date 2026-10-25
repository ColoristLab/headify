import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderBanner, resolveTemplate } from "../src/renderer.js";
import loadTemplate from "../src/load-template.js";

let cwd: string;

afterEach(async () => {
  vi.restoreAllMocks();
  if (cwd) await rm(cwd, { recursive: true, force: true });
});

describe("resolveTemplate", () => {
  it("returns the default template when no path is supplied", async () => {
    const template = await resolveTemplate();

    expect(template).toBeTypeOf("function");
  });

  it("loads an ESM JavaScript template", async () => {
    cwd = await mkdtemp(join(tmpdir(), "headmark-template-"));
    const path = join(cwd, "template.mjs");
    await writeFile(path, "export default (ctx) => `// ${ctx.file.name}`;", "utf8");

    const template = await resolveTemplate(path);

    await expect(Promise.resolve(template({
      package: { name: "demo" },
      year: 2026,
      file: { path: "src/a.ts", name: "a.ts", basename: "a", ext: ".ts" },
    }))).resolves.toBe("// a.ts");
  });

  it("loads a CommonJS template", async () => {
    cwd = await mkdtemp(join(tmpdir(), "headmark-template-"));
    const path = join(cwd, "template.cjs");
    await writeFile(path, "module.exports = (ctx) => '// ' + ctx.file.name;", "utf8");

    const template = await loadTemplate(path);

    expect(await template({
      package: { name: "demo" },
      year: 2026,
      file: { path: "a.js", name: "a.js", basename: "a", ext: ".js" },
    })).toBe("// a.js");
  });

  it("rejects unsupported template extensions", async () => {
    cwd = await mkdtemp(join(tmpdir(), "headmark-template-"));
    const path = join(cwd, "template.json");
    await writeFile(path, "{}", "utf8");

    await expect(loadTemplate(path)).rejects.toThrow("Unsupported template extension: .json");
  });

  it("rejects templates that do not export a function", async () => {
    cwd = await mkdtemp(join(tmpdir(), "headmark-template-"));
    const path = join(cwd, "template.mjs");
    await writeFile(path, "export default 'not a function';", "utf8");

    await expect(loadTemplate(path)).rejects.toThrow("must export a function");
  });
});

describe("renderBanner", () => {
  const context = {
    package: { name: "demo" },
    year: 2026,
    file: { path: "src/a.ts", name: "a.ts", basename: "a", ext: ".ts" },
  };

  it("returns a synchronous template result", async () => {
    await expect(renderBanner(() => "/* banner */", context)).resolves.toBe("/* banner */");
  });

  it("supports asynchronous template functions", async () => {
    await expect(renderBanner(async () => "/* async banner */", context))
      .resolves.toBe("/* async banner */");
  });

  it("throws if the template result is not a string", async () => {
    await expect(renderBanner(() => 123 as never, context))
      .rejects.toThrow("Failed to render banner template.");
  });
});

import { describe, it, expect } from "vitest";

import { createContext } from "../src/context.ts";

describe("createContext", () => {
  const pkg = { name: "test", version: "1.0.0" } as any;

  it("builds context with file info", () => {
    const ctx = createContext(pkg, "src/a.ts", "/project");
    expect(ctx.package).toBe(pkg);
    expect(ctx.year).toBe(new Date().getFullYear());
    expect(ctx.file.path).toBe("src/a.ts");
    expect(ctx.file.name).toBe("a.ts");
    expect(ctx.file.basename).toBe("a");
    expect(ctx.file.ext).toBe(".ts");
  });

  it("handles nested paths", () => {
    const ctx = createContext(pkg, "a/b/c.js", "/project");
    expect(ctx.file.path).toBe("a/b/c.js");
    expect(ctx.file.ext).toBe(".js");
  });

  it("handles files without extension", () => {
    const ctx = createContext(pkg, "README", "/project");
    expect(ctx.file.name).toBe("README");
    expect(ctx.file.basename).toBe("README");
    expect(ctx.file.ext).toBe("");
  });

  it("handles absolute input paths", () => {
    const ctx = createContext(pkg, "/project/src/a.ts", "/project");
    expect(ctx.file.path).toBe("src/a.ts");
  });
});

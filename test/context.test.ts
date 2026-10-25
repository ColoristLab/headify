import { describe, expect, it } from "vitest";
import { createContext } from "../src/context.js";

describe("createContext", () => {
  const packageMetadata = {
    name: "demo",
    version: "1.0.0",
  };

  it("builds package, year and file context", () => {
    const before = new Date().getFullYear();
    const context = createContext(packageMetadata, "src/index.ts", "/project");

    expect(context.package).toBe(packageMetadata);
    expect(context.year).toBe(before);
    expect(context.file).toEqual({
      path: "src/index.ts",
      name: "index.ts",
      basename: "index",
      ext: ".ts",
    });
  });

  it("normalizes Windows separators in the relative path", () => {
    const context = createContext(packageMetadata, "src/components/button.js", "/project");

    expect(context.file.path).toBe("src/components/button.js");
  });

  it("supports files without extensions", () => {
    const context = createContext(packageMetadata, "LICENSE", "/project");

    expect(context.file).toEqual({
      path: "LICENSE",
      name: "LICENSE",
      basename: "LICENSE",
      ext: "",
    });
  });

  it("supports dotfiles", () => {
    const context = createContext(packageMetadata, ".editorconfig", "/project");

    expect(context.file).toEqual({
      path: ".editorconfig",
      name: ".editorconfig",
      basename: ".editorconfig",
      ext: "",
    });
  });

  it("resolves absolute file paths and keeps paths relative to cwd", () => {
    const context = createContext(packageMetadata, "/project/lib/index.js", "/project");

    expect(context.file.path).toBe("lib/index.js");
    expect(context.file.name).toBe("index.js");
  });
});

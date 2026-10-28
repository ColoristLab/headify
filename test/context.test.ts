import { describe, expect, it } from "vitest";

import { createContext } from "../src/context.ts";

describe("createContext", () => {
  const packageMetadata = {
    name: "demo",
    version: "1.0.0",
  };

  it("构建包含包信息、年份和文件信息的上下文", () => {
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

  it("规范化相对路径中的 Windows 路径分隔符", () => {
    const context = createContext(packageMetadata, "src/components/button.js", "/project");

    expect(context.file.path).toBe("src/components/button.js");
  });

  it("支持没有扩展名的文件", () => {
    const context = createContext(packageMetadata, "LICENSE", "/project");

    expect(context.file).toEqual({
      path: "LICENSE",
      name: "LICENSE",
      basename: "LICENSE",
      ext: "",
    });
  });

  it("支持以点开头的隐藏文件", () => {
    const context = createContext(packageMetadata, ".editorconfig", "/project");

    expect(context.file).toEqual({
      path: ".editorconfig",
      name: ".editorconfig",
      basename: ".editorconfig",
      ext: "",
    });
  });

  it("解析绝对文件路径，并使路径保持相对于当前工作目录", () => {
    const context = createContext(packageMetadata, "/project/lib/index.js", "/project");

    expect(context.file.path).toBe("lib/index.js");
    expect(context.file.name).toBe("index.js");
  });
});

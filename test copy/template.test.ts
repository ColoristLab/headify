import { describe, it, expect } from "vitest";

import template from "../src/template.ts";

describe("default template", () => {
  it("renders package metadata and copyright year", () => {
    const out = template({
      package: {
        name: "my-pkg",
        version: "1.2.3",
        homepage: "https://example.com",
        author: "Me",
        license: "MIT",
      } as any,
      year: 2024,
      file: { path: "", name: "", basename: "", ext: "" },
    });

    expect(out).toContain("my-pkg v1.2.3");
    expect(out).toContain("https://example.com");
    expect(out).toContain("Copyright (c) 2024");
    expect(out).toContain("Licensed under the MIT license");
  });

  it("uses startYear range when present", () => {
    const out = template({
      package: {
        name: "p",
        version: "1.0.0",
        homepage: "h",
        author: "a",
        license: "L",
      } as any,
      year: 2024,
      startYear: 2020,
      file: { path: "", name: "", basename: "", ext: "" },
    });

    expect(out).toContain("Copyright (c) 2020-2024");
  });
});

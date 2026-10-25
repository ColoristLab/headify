import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/load-template.ts", () => ({ default: vi.fn() }));
vi.mock("../src/template.ts", () => ({ default: vi.fn() }));

import loadTemplate from "../src/load-template.ts";
import { resolveTemplate, renderBanner } from "../src/renderer.ts";
import defaultTemplate from "../src/template.ts";

describe("renderer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("resolveTemplate loads the given path", async () => {
    const fn = vi.fn();
    (loadTemplate as any).mockResolvedValue(fn);
    const result = await resolveTemplate("tpl.ts");
    expect(loadTemplate).toHaveBeenCalledWith("tpl.ts");
    expect(result).toBe(fn);
  });

  it("resolveTemplate falls back to default template", async () => {
    const result = await resolveTemplate();
    expect(result).toBe(defaultTemplate);
  });

  it("renderBanner returns the template string", async () => {
    const fn = vi.fn().mockResolvedValue("banner");
    expect(await renderBanner(fn, {} as any)).toBe("banner");
  });

  it("renderBanner throws if template output is not a string", async () => {
    const fn = vi.fn().mockResolvedValue(42);
    await expect(renderBanner(fn, {} as any)).rejects.toThrow("Failed to render banner template.");
  });
});

import { describe, it, expect } from "vitest";

import * as mod from "../src/index.ts";

describe("public API", () => {
  it("re-exports headmark", () => {
    expect(typeof mod.headmark).toBe("function");
  });

  // it("re-exports dedent", () => {
  //   expect(typeof mod.dedent).toBe("function");
  //   expect(mod.dedent`  a  `).toBe("a");
  // });
});

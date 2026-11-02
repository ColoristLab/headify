import { dedent } from "ts-dedent";
import { describe, expect, it } from "vitest";

import * as publicApi from "../src/index.ts";

describe("导出 api 测试", () => {
  it("应该导出 headify", () => {
    expect(publicApi.headify).toBeTypeOf("function");
  });

  it("应该导出 dedent", () => {
    expect(publicApi.dedent).toBe(dedent);
  });
});

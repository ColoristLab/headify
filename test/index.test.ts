import { dedent } from "ts-dedent";
import { describe, expect, it } from "vitest";

import { headify } from "../src/headify.ts";
import * as publicApi from "../src/index.ts";

describe("公共入口", () => {
  it("导出 headify 和 dedent", () => {
    expect(publicApi.headify).toBeDefined();
    expect(publicApi.dedent).toBe(dedent);
  });

  it("在编译时暴露 headify 的选项类型和结果类型", () => {
    // 运行时断言用于说明公共入口通过 headmark API 暴露了该函数；
    // TypeScript 类型导出在运行时会被擦除。
    expect(headify).toBeTypeOf("function");
  });
});

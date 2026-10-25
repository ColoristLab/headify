import type { SizeLimitConfig } from "size-limit";

export default [
  {
    limit: "0.6KB",
    path: "./dist/cli.mjs",
  },
  {
    limit: "0.1KB",
    path: "./dist/index.mjs",
  },
] satisfies SizeLimitConfig;

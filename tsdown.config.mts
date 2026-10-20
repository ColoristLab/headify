import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"], // 入口文件
  format: ["esm"], // 输出 ES Module 格式
  platform: "node", // 目标运行平台
  fixedExtension: true, // 固定使用 .mjs 扩展名
  dts: true, // 生成 TypeScript 类型声明
  sourcemap: true, // 生成 Source Map 文件
  minify: false, // 不压缩输出代码
  clean: true, // 构建前清理输出目录
});

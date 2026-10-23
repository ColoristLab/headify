import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";

const inputDir = resolve(process.argv[2] ?? "src");
const outputFile = resolve("code.txt");

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else if (entry.isFile() && fullPath !== outputFile) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const files = await collectFiles(inputDir);

  // 按文件相对路径排序，保证输出顺序稳定
  files.sort((a, b) => relative(inputDir, a).localeCompare(relative(inputDir, b)));

  const sections = await Promise.all(
    files.map(async (file) => {
      const filePath = relative(process.cwd(), file).split(sep).join("/");
      const content = await readFile(file, "utf8");

      return `${filePath}\n\n${content.replace(/\s+$/, "")}`;
    }),
  );

  await writeFile(outputFile, sections.length ? `${sections.join("\n\n\n")}\n` : "", "utf8");

  console.log(`已导出 ${files.length} 个文件到 ${outputFile}`);
}

main().catch((error) => {
  console.error("导出失败：", error);
  process.exitCode = 1;
});

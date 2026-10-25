import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";

export async function createProject() {
  const cwd = await mkdtemp(join(tmpdir(), "headmark-test-"));

  await writeFile(
    join(cwd, "package.json"),
    JSON.stringify({
      name: "test-project",
      version: "1.2.3",
      homepage: "https://example.com",
      author: "Test Author",
      license: "MIT",
    }, null, 2),
  );

  return {
    cwd,
    async writeFile(relativePath: string, content: string) {
      const path = join(cwd, relativePath);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, content, "utf8");
      return path;
    },
    readFile(relativePath: string) {
      return readFile(join(cwd, relativePath), "utf8");
    },
    async cleanup() {
      await rm(cwd, { recursive: true, force: true });
    },
  };
}

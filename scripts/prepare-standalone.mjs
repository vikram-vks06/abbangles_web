import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");
const copies = [
  [path.join(root, "public"), path.join(standalone, "public")],
  [path.join(root, ".next", "static"), path.join(standalone, ".next", "static")],
];

await mkdir(path.join(standalone, ".next"), { recursive: true });
for (const [source, destination] of copies) {
  await cp(source, destination, { recursive: true, force: true });
}

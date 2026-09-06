import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const indexFile = path.join(distDir, "index.html");
const courseDir = path.join(root, "src", "content", "courses");
const coursesTs = path.join(root, "src", "data", "courses.ts");

if (!fs.existsSync(indexFile)) {
  throw new Error(`Missing build output: ${indexFile}`);
}

const html = fs.readFileSync(indexFile, "utf8");
const routes = new Set([
  "/teaching",
  "/publications",
  "/grants",
  "/research-products",
]);

for (const name of fs.readdirSync(courseDir)) {
  if (!name.endsWith(".md") || name.startsWith("_")) continue;

  const file = path.join(courseDir, name);
  const raw = fs.readFileSync(file, "utf8");

  const published = raw.match(/^published:\s*(.+?)\s*$/m)?.[1]?.trim().toLowerCase();
  if (published === "false") continue;

  const slug = raw.match(/^slug:\s*["']?([^"'\n]+?)["']?\s*$/m)?.[1]?.trim();
  if (!slug) continue;

  routes.add(`/teaching/${slug}`);
}

if (fs.existsSync(coursesTs)) {
  const source = fs.readFileSync(coursesTs, "utf8");
  const aliasBlock =
    source.match(/const aliases:[\s\S]*?=\s*\{([\s\S]*?)\};/m)?.[1] ?? "";

  for (const match of aliasBlock.matchAll(/["']([^"']+)["']\s*:\s*["']([^"']+)["']/g)) {
    routes.add(`/teaching/${match[1]}`);
  }
}

for (const route of [...routes].sort()) {
  const relative = route.replace(/^\/+|\/+$/g, "");
  if (!relative) continue;

  const outputDir = path.join(distDir, relative);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), html);
}

fs.writeFileSync(path.join(distDir, "404.html"), html);
fs.writeFileSync(path.join(distDir, ".nojekyll"), "");

console.log(`Generated ${routes.size} physical SPA routes:`);
for (const route of [...routes].sort()) {
  console.log(`  ${route}`);
}

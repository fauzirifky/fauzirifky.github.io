import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const indexFile = path.join(distDir, "index.html");
const courseFile = path.join(root, "src", "data", "courses.generated.json");
const aliasFile = path.join(root, "src", "data", "course-aliases.json");

if (!fs.existsSync(indexFile)) {
  throw new Error(`Missing build output: ${indexFile}`);
}

const html = fs.readFileSync(indexFile, "utf8");
const courses = JSON.parse(fs.readFileSync(courseFile, "utf8"));
const aliases = JSON.parse(fs.readFileSync(aliasFile, "utf8"));

const routes = new Set([
  "/teaching",
  "/publications",
  "/grants",
  "/research-products"
]);

for (const course of courses) {
  if (!course.slug) continue;
  routes.add(`/teaching/${course.slug}`);
}

for (const alias of Object.keys(aliases)) {
  routes.add(`/teaching/${alias}`);
}

for (const route of [...routes].sort()) {
  const relative = route.replace(/^\/+|\/+$/g, "");
  const outputDir = path.join(distDir, relative);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "index.html"), html);
}

fs.writeFileSync(path.join(distDir, "404.html"), html);
fs.writeFileSync(path.join(distDir, ".nojekyll"), "");

console.log(`Generated ${routes.size} physical routes:`);
for (const route of [...routes].sort()) {
  console.log(`  ${route}`);
}

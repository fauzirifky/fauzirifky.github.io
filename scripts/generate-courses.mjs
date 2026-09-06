import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const courseDir = path.join(root, "src", "content", "courses");
const output = path.join(root, "src", "data", "courses.generated.json");

function unquote(value = "") {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function parseDocument(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const i = line.indexOf(":");
    if (i < 0) continue;
    meta[line.slice(0, i).trim()] = unquote(line.slice(i + 1).trim());
  }
  return { meta, body: match[2] };
}

function section(body, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^##\\s+${escaped}\\s*$`, "mi");
  const match = regex.exec(body);
  if (!match || match.index == null) return "";
  const rest = body.slice(match.index + match[0].length).replace(/^\s*\n/, "");
  const next = rest.search(/^##\s+/m);
  return (next >= 0 ? rest.slice(0, next) : rest).trim();
}

function cleanText(value) {
  return value.replace(/<!--[\s\S]*?-->/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function parseList(value) {
  return value
    .split("\n")
    .map((line) => line.match(/^\s*-\s+(.+?)\s*$/)?.[1])
    .filter(Boolean)
    .filter((item) => item.trim() !== "-")
    .filter((item) => !item.toLowerCase().includes("belum ditambahkan"));
}

function parsePipeList(value = "") {
  return value.split("|").map((x) => x.trim()).filter(Boolean);
}

function linkFromCell(cell = "") {
  const match = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  return match ? { label: match[1].trim(), url: match[2].trim() } : undefined;
}

function parseMaterials(value) {
  const rows = value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|") && line.endsWith("|"))
    .map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()));

  if (rows.length < 2) return [];

  return rows
    .slice(1)
    .filter((row) => !row.every((cell) => /^:?-{3,}:?$/.test(cell)))
    .map((row) => {
      const pdf = linkFromCell(row[1]);
      return { name: row[0] || pdf?.label || "Material", ...(pdf?.url ? { pdf: pdf.url } : {}) };
    })
    .filter((item) => item.name && item.pdf);
}

const courses = [];

for (const filename of fs.readdirSync(courseDir).sort()) {
  if (!filename.endsWith(".md") || filename.startsWith("_")) continue;

  const { meta, body } = parseDocument(fs.readFileSync(path.join(courseDir, filename), "utf8"));
  if (meta.published?.toLowerCase() === "false") continue;
  if (!meta.slug || !meta.title) throw new Error(`${filename}: slug dan title wajib diisi.`);

  courses.push({
    slug: meta.slug.trim(),
    title: meta.title.trim(),
    titleEn: (meta.title_en || meta.title).trim(),
    ...(meta.code ? { code: meta.code.trim() } : {}),
    ...(meta.credits ? { credits: meta.credits.trim() } : {}),
    ...(meta.prerequisite ? { prerequisite: meta.prerequisite.trim() } : {}),
    teamTeaching: parsePipeList(meta.team_teaching),
    media: parsePipeList(meta.media),
    assessment: parsePipeList(meta.assessment),
    institution: (meta.institution || "Institut Teknologi Sumatera").trim(),
    role: (meta.role || "Lecturer").trim(),
    ...(meta.year ? { year: meta.year.trim() } : {}),
    ...(meta.summary ? { summary: meta.summary.trim() } : {}),
    featured: meta.featured?.toLowerCase() === "true",
    order: Number(meta.order || 999),
    description: cleanText(section(body, "Deskripsi Mata Kuliah")),
    focus: cleanText(section(body, "Fokus Utama")),
    topics: parseList(section(body, "Pokok Bahasan")),
    projects: parseList(section(body, "Daftar Project")),
    materials: parseMaterials(section(body, "Bahan Ajar")),
  });
}

courses.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

const slugs = new Set();
for (const c of courses) {
  if (slugs.has(c.slug)) throw new Error(`Duplicate course slug: ${c.slug}`);
  slugs.add(c.slug);
}

for (const required of [
  "numerical-methods",
  "fundamentals-of-programming",
  "partial-differential-equations",
  "selected-topics-in-computational-mathematics",
]) {
  if (!slugs.has(required)) throw new Error(`Required course missing: ${required}`);
}

fs.writeFileSync(output, JSON.stringify(courses, null, 2) + "\n");
console.log(`Generated ${courses.length} courses`);
for (const c of courses) console.log(`  ${c.slug} | ${c.credits ?? "—"} SKS | PDF=${c.materials.length}`);

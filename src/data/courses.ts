export type CourseMaterial = {
  name: string;
  pdf?: string;
  source?: string;
};

export type Course = {
  slug: string;
  title: string;
  titleEn: string;
  code?: string;
  credits?: string;
  institution: string;
  role: string;
  year?: string;
  summary?: string;
  featured: boolean;
  order: number;
  description: string;
  projects: string[];
  materials: CourseMaterial[];
};

type FrontMatter = Record<string, string>;

const courseFiles = import.meta.glob("../content/courses/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function unquote(value: string) {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function parseDocument(raw: string): { meta: FrontMatter; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const meta: FrontMatter = {};
  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    meta[key] = unquote(value);
  }

  return { meta, body: match[2] };
}

function section(body: string, heading: string) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`^##\\s+${escaped}\\s*$`, "mi");
  const match = regex.exec(body);
  if (!match || match.index == null) return "";

  const remainder = body.slice(match.index + match[0].length).replace(/^\s*\n/, "");
  const nextHeading = remainder.search(/^##\s+/m);
  return (nextHeading >= 0 ? remainder.slice(0, nextHeading) : remainder).trim();
}

function cleanText(value: string) {
  return value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseProjects(value: string) {
  return value
    .split("\n")
    .map((line) => line.match(/^\s*-\s+(.+?)\s*$/)?.[1])
    .filter((item): item is string => Boolean(item))
    .filter((item) => !item.toLowerCase().includes("belum ditambahkan"));
}

function linkFromCell(cell: string) {
  const match = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  return match ? { label: match[1].trim(), url: match[2].trim() } : undefined;
}

function parseMaterials(value: string): CourseMaterial[] {
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
      const pdf = linkFromCell(row[1] ?? "");
      const source = linkFromCell(row[2] ?? "");
      return {
        name: row[0] || pdf?.label || source?.label || "Material",
        pdf: pdf?.url,
        source: source?.url,
      };
    })
    .filter((item) => item.name && (item.pdf || item.source));
}

function parseCourse(raw: string): Course | null {
  const { meta, body } = parseDocument(raw);
  if (meta.published?.toLowerCase() === "false") return null;
  if (!meta.slug || !meta.title) return null;

  return {
    slug: meta.slug,
    title: meta.title,
    titleEn: meta.title_en || meta.title,
    code: meta.code || undefined,
    credits: meta.credits || undefined,
    institution: meta.institution || "Institut Teknologi Sumatera",
    role: meta.role || "Lecturer",
    year: meta.year || undefined,
    summary: meta.summary || undefined,
    featured: meta.featured?.toLowerCase() === "true",
    order: Number(meta.order || 999),
    description: cleanText(section(body, "Deskripsi Mata Kuliah")),
    projects: parseProjects(section(body, "Daftar Project")),
    materials: parseMaterials(section(body, "Bahan Ajar")),
  };
}

export const courses = Object.values(courseFiles)
  .map(parseCourse)
  .filter((course): course is Course => course !== null)
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

export const featuredCourses = courses.filter((course) => course.featured);

const aliases: Record<string, string> = {
  "mathematical-modeling": "mathematical-simulation-and-computation",
};

export function getCourse(slug?: string) {
  if (!slug) return undefined;
  const canonical = aliases[slug] ?? slug;
  return courses.find((course) => course.slug === canonical);
}

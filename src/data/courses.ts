import generatedCourses from "./courses.generated.json";

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

export const courses = generatedCourses as Course[];

export const featuredCourses = courses.filter((course) => course.featured);

export const courseAliases: Record<string, string> = {
  "mathematical-modeling": "mathematical-simulation-and-computation",
  "computational-modeling-and-numerical-analysis": "numerical-methods",
  "programming-for-data-science-and-scientific-computing":
    "fundamentals-of-programming",
};

export function normalizeCourseSlug(input?: string) {
  if (!input) return "";

  let value = input.trim();

  try {
    value = decodeURIComponent(value);
  } catch {
    // Keep the original value if malformed URL encoding is encountered.
  }

  value = value
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/[?#].*$/, "")
    .replace(/\/index\.html$/i, "")
    .replace(/^\/+|\/+$/g, "");

  if (value.startsWith("teaching/")) {
    value = value.slice("teaching/".length);
  }

  if (value.includes("/")) {
    value = value.split("/").filter(Boolean).pop() ?? "";
  }

  return value.toLowerCase();
}

export function getCourse(input?: string) {
  const slug = normalizeCourseSlug(input);
  if (!slug) return undefined;

  const canonical = courseAliases[slug] ?? slug;
  return courses.find((course) => course.slug.toLowerCase() === canonical);
}

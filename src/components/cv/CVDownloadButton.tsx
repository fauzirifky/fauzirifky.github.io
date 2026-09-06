import { useState } from "react";
import Button from "../ui/Button";
import CVDocument from "../../pdf/CVDocument";
import { cvData } from "../../data/cv";
import { courses } from "../../data/courses";
import publicationData from "../../data/publications.json";
import { pdf } from "@react-pdf/renderer";

export default function CVDownloadButton() {
  const [loading, setLoading] = useState(false);

  async function onDownload() {
    try {
      setLoading(true);

      const cvForPdf = {
        ...cvData,
        sidebarSkills: cvData.sidebarSkills.filter(
          (group) => group.title.toLowerCase() !== "tools",
        ),
        publications: publicationData,
        teaching: courses.map((course) => ({
          course: [
            course.title,
            course.code ? `(${course.code})` : "",
            course.credits ? `— ${course.credits} SKS` : "",
          ].filter(Boolean).join(" "),
          institution: course.institution,
          role: course.role,
          year: course.year,
          slug: course.slug,
          summary: course.summary,
        })),
      };

      const blob = await pdf(<CVDocument data={cvForPdf} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Rifky_Fauzi_CV.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={onDownload} disabled={loading}>
      {loading ? "Preparing…" : "Download CV"}
    </Button>
  );
}

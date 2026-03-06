import { useState } from "react";
import Button from "../ui/Button";
import CVDocument from "../../pdf/CVDocument";
import { cvData } from "../../data/cv";
import { pdf } from "@react-pdf/renderer";

export default function CVDownloadButton() {
  const [loading, setLoading] = useState(false);

  async function onDownload() {
    try {
      setLoading(true);
      const blob = await pdf(<CVDocument data={cvData} />).toBlob();
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

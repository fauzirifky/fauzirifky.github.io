import Container from "../components/layout/Container";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { cvData } from "../data/cv";
import { Link } from "react-router-dom";

export default function Teaching() {
  const { teaching } = cvData;

  return (
    <Container>
      <div className="pageHeader">
        <h1>Teaching</h1>
        <p className="muted">Click a course for a detail page (syllabus, software, repositories, notes).</p>
      </div>

      <Section title="Courses">
        <div className="grid">
          {teaching.map((t) => (
            <Card key={t.slug} className="card--click" role="link" tabIndex={0} onClick={() => (window.location.href = `/teaching/${t.slug}`)} onKeyDown={(e) => { if (e.key === "Enter") window.location.href = `/teaching/${t.slug}`; }}>
              <h3>
                <Link className="link" to={`/teaching/${t.slug}`}>{t.course}</Link>
              </h3>
              <div className="small">{t.institution} • {t.role}{t.year ? ` • ${t.year}` : ""}</div>
              {t.summary ? <p className="muted">{t.summary}</p> : null}
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}

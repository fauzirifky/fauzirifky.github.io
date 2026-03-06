import { useParams, Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { cvData } from "../data/cv";

export default function TeachingDetail() {
  const { slug } = useParams();
  const course = cvData.teaching.find((t) => t.slug === slug);

  if (!course) {
    return (
      <Container>
        <div className="pageHeader">
          <h1>Course not found</h1>
          <Link className="link" to="/teaching">Back to Teaching</Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="pageHeader">
        <h1>{course.course}</h1>
        <p className="muted">{course.institution} • {course.role}{course.year ? ` • ${course.year}` : ""}</p>
        <Link className="link" to="/teaching">← Back to Teaching</Link>
      </div>

      <Section title="Overview">
        <Card>
          <p className="muted">{course.summary ?? "Add a course summary in src/data/cv.ts."}</p>
          <p className="small">This page is a template. Add syllabus, software, repositories, and notes links per course in <code>cv.ts</code>.</p>
        </Card>
      </Section>

      <Section title="Resources (software / repos / notes)">
        <div className="grid">
          {(course.resources ?? []).map((r) => (
            <Card key={r.label}>
              <h3>{r.label}</h3>
              <div className="small">{r.kind ?? "resource"}</div>
              <a className="link" href={r.url} target="_blank" rel="noreferrer">{r.url}</a>
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}

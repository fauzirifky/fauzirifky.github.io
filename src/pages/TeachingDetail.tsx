import { useParams, Link } from "react-router-dom";
import Container from "../components/layout/Container";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { getCourse } from "../data/courses";

export default function TeachingDetail() {
  const { slug } = useParams();
  const course = getCourse(slug);

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
        <h1>{course.title}</h1>
        <p className="muted" style={{ marginBottom: 6 }}>{course.titleEn}</p>
        <div className="small">
          {course.code ? `${course.code} • ` : ""}
          SKS: {course.credits || "—"} • {course.institution} • {course.role}
          {course.year ? ` • ${course.year}` : ""}
        </div>
        <div style={{ marginTop: 8 }}>
          <Link className="link" to="/teaching">← Back to Teaching</Link>
        </div>
      </div>

      <Section title="Deskripsi Mata Kuliah">
        <Card>
          <p style={{ whiteSpace: "pre-line" }}>
            {course.description || "Deskripsi belum ditambahkan pada file Markdown mata kuliah."}
          </p>
        </Card>
      </Section>

      <Section title="SKS">
        <Card>
          <strong>{course.credits || "—"} SKS</strong>
          {course.code ? <div className="small" style={{ marginTop: 4 }}>Kode mata kuliah: {course.code}</div> : null}
        </Card>
      </Section>

      <Section title="Daftar Project">
        <Card>
          {course.projects.length ? (
            <ul className="list">
              {course.projects.map((project) => <li key={project}>{project}</li>)}
            </ul>
          ) : (
            <p className="muted">Daftar project belum ditambahkan.</p>
          )}
        </Card>
      </Section>

      <Section title="Bahan Ajar">
        {course.materials.length ? (
          <div className="grid">
            {course.materials.map((material) => (
              <Card key={`${material.name}-${material.pdf ?? material.source}`}>
                <h3>{material.name}</h3>
                <div className="row" style={{ marginTop: 10 }}>
                  {material.pdf ? (
                    <a className="link" href={material.pdf} target="_blank" rel="noreferrer">PDF langsung</a>
                  ) : null}
                  {material.source ? (
                    <a className="link" href={material.source} target="_blank" rel="noreferrer">Source LaTeX</a>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <p className="muted">Bahan ajar belum ditambahkan.</p>
          </Card>
        )}
      </Section>
    </Container>
  );
}

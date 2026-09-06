import type { ReactNode } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Container from "../components/layout/Container";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { getCourse } from "../data/courses";

type Props = { forcedSlug?: string };

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="small" style={{ marginBottom: 4 }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default function TeachingDetail({ forcedSlug }: Props) {
  const { slug: paramSlug } = useParams();
  const location = useLocation();

  const course =
    getCourse(forcedSlug) ??
    getCourse(paramSlug) ??
    getCourse(location.pathname) ??
    getCourse(window.location.pathname);

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
          {course.credits ? `${course.credits} SKS • ` : ""}
          {course.institution}
          {course.year ? ` • ${course.year}` : ""}
        </div>
        <div style={{ marginTop: 8 }}>
          <Link className="link" to="/teaching">← Back to Teaching</Link>
        </div>
      </div>

      <Section title="Informasi Mata Kuliah">
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 18 }}>
            <InfoItem label="SKS / Prasyarat">
              {course.credits ? `${course.credits} SKS` : "—"}
              {course.prerequisite ? ` / ${course.prerequisite}` : ""}
            </InfoItem>
            <InfoItem label="Team Teaching">
              {course.teamTeaching.length ? course.teamTeaching.join(", ") : "—"}
            </InfoItem>
            <InfoItem label="Software / Media">
              {course.media.length ? course.media.join(", ") : "—"}
            </InfoItem>
            <InfoItem label="Komposisi Penilaian">
              {course.assessment.length ? course.assessment.join(", ") : "—"}
            </InfoItem>
          </div>
        </Card>
      </Section>

      {course.description ? (
        <Section title="Deskripsi Mata Kuliah">
          <Card><p style={{ whiteSpace: "pre-line" }}>{course.description}</p></Card>
        </Section>
      ) : null}

      {course.focus ? (
        <Section title="Fokus Utama"><Card><p>{course.focus}</p></Card></Section>
      ) : null}

      {course.topics.length ? (
        <Section title="Pokok Bahasan">
          <Card><ul className="list">{course.topics.map((x) => <li key={x}>{x}</li>)}</ul></Card>
        </Section>
      ) : null}

      {course.projects.length ? (
        <Section title="Daftar Project">
          <Card><ul className="list">{course.projects.map((x) => <li key={x}>{x}</li>)}</ul></Card>
        </Section>
      ) : null}

      {course.materials.length ? (
        <Section title="Bahan Ajar">
          <div className="grid">
            {course.materials.map((m) => (
              <Card key={`${m.name}-${m.pdf}`}>
                <h3>{m.name}</h3>
                <div style={{ marginTop: 10 }}>
                  <a className="link" href={m.pdf} target="_blank" rel="noreferrer">PDF</a>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ) : null}
    </Container>
  );
}

import Container from "../components/layout/Container";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { courses } from "../data/courses";
import { Link, useNavigate } from "react-router-dom";

export default function Teaching() {
  const navigate = useNavigate();

  return (
    <Container>
      <div className="pageHeader">
        <h1>Teaching</h1>
        <p className="muted">
          Course information, learning focus, assessment, and publicly available teaching materials.
        </p>
      </div>

      <Section title="Courses">
        <div className="grid">
          {courses.map((course) => (
            <Card
              key={course.slug}
              className="card--click"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/teaching/${course.slug}`)}
              onKeyDown={(e) => { if (e.key === "Enter") navigate(`/teaching/${course.slug}`); }}
            >
              <h3><Link className="link" to={`/teaching/${course.slug}`}>{course.title}</Link></h3>
              <div className="small">{course.titleEn}</div>
              <div className="small" style={{ marginTop: 6 }}>
                {course.code ? `${course.code} • ` : ""}
                {course.credits ? `${course.credits} SKS` : ""}
                {course.prerequisite ? ` • Prasyarat: ${course.prerequisite}` : ""}
              </div>
              {course.summary ? <p className="muted">{course.summary}</p> : null}
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}

import Container from "../components/layout/Container";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { courses } from "../data/courses";
import { Link } from "react-router-dom";

export default function Teaching() {
  return (
    <Container>
      <div className="pageHeader">
        <h1>Teaching</h1>
        <p className="muted">
          Click a course for description, credits, projects, slides, worksheets, practical modules, and source files.
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
              onClick={() => (window.location.href = `/teaching/${course.slug}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") window.location.href = `/teaching/${course.slug}`;
              }}
            >
              <h3>
                <Link className="link" to={`/teaching/${course.slug}`}>{course.title}</Link>
              </h3>
              <div className="small">{course.titleEn}</div>
              <div className="small" style={{ marginTop: 4 }}>
                {course.code ? `${course.code} • ` : ""}
                {course.credits ? `${course.credits} SKS • ` : ""}
                {course.institution}
              </div>
              {course.summary ? <p className="muted">{course.summary}</p> : null}
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}

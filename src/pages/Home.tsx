import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import { cvData } from "../data/cv";
import { Link } from "react-router-dom";

export default function Home() {
  const { person, currentPosition, education, certifications, researchProducts, skills, teaching, publications, grants } = cvData;

  const pubsSorted = [...publications].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  const grantsSorted = [...grants].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <Container>
      <div className="aboveFold">
        <Card className="identityCard">
          <div style={{ height: 3, width: 52, background: "var(--accent2)", borderRadius: 999, marginBottom: 10 }} />
          <h1 className="name">{person.name}</h1>
          <p className="subtitle">
            {currentPosition.position} — {currentPosition.department}, {currentPosition.institution}
          </p>
          <div className="metaGrid">
            <div>{person.location}</div>
            <div>
              <a className="link" href={`mailto:${person.email}`}>
                {person.email}
              </a>
            </div>
            <div>
              ORCID: <a className="link" href={`https://orcid.org/${person.orcid}`} target="_blank" rel="noreferrer">{person.orcid}</a>
            </div>
            <div>
              GitHub: <a className="link" href={person.github.url} target="_blank" rel="noreferrer">{person.github.label}</a>
            </div>
            <div>
              LinkedIn: <a className="link" href={person.linkedin.url} target="_blank" rel="noreferrer">{person.linkedin.label}</a>
            </div>
          </div>
        </Card>

        <div className="stack">
          <div className="photoFrame">
            <img
              src={`${import.meta.env.BASE_URL}${(person.photoPath ?? "").replace(/^\//, "")}`}
              alt={`${person.name} photo`}
            />
          </div>

          <Card className="compactCard">
            <h3>Education</h3>
            <ul className="compactList">
              {education.map((e) => (
                <li key={e.degree}>
                  <strong>{e.degree.replace(" in Mathematics", "")}</strong> — {e.institution} ({e.year})
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="compactGrid">
        <Card className="compactCard">
          <h3>Certifications</h3>
          <ul className="compactList">
            {certifications.map((c) => (
              <li key={c.name}>
                <strong>{c.name}</strong> — {c.date}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="compactCard">
          <h3>Research Products</h3>
          <ul className="compactList">
            {researchProducts.map((p) => (
              <li key={p.name}>
                <strong>{p.name}</strong> <span className="small">({p.category})</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 8 }}>
            <Link className="link" to="/research-products">View all →</Link>
          </div>
        </Card>
      </div>

      <Section title="Skills">
        <div className="grid">
          <Card>
            <h3>Skills</h3>

            {cvData.sidebarSkills.map((g) => (
              <div key={g.title} style={{ marginTop: 10 }}>
                <div style={{ fontWeight: 700 }}>{g.title}</div>
                <div style={{ marginTop: 4 }}>
                  {g.items.join(", ")}
                </div>
              </div>
            ))}
          </Card>
          <Card>
            <h3>Languages</h3>
            <ul className="list">{skills.languages.map((s) => <li key={s}>{s}</li>)}</ul>
          </Card>
          <Card>
            <h3>Soft Skills</h3>
            <ul className="list">{skills.soft.map((s) => <li key={s}>{s}</li>)}</ul>
          </Card>
        </div>
      </Section>

      <Section title="Teaching (click a course for details)" right={<Link className="link" to="/teaching">All courses</Link>}>
        <div className="grid">
          {teaching.slice(0, 6).map((t) => (
            <Card key={t.slug} className="card--click" role="link" tabIndex={0} onClick={() => (window.location.href = `/teaching/${t.slug}`)} onKeyDown={(e) => { if (e.key === "Enter") window.location.href = `/teaching/${t.slug}`; }}>
              <h3>
                <Link className="link" to={`/teaching/${t.slug}`}>{t.course}</Link>
              </h3>
              <div className="small">{t.institution} • {t.role}{t.year ? ` • ${t.year}` : ""}</div>
              <p className="muted">{t.summary}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Publications (scroll inside)">
        <div className="scroller">
          <div className="stack">
            {pubsSorted.map((p) => (
              <div key={p.url}>
                <div className="small">{p.year}</div>
                <div><strong>{p.title}</strong></div>
                <div className="muted">{p.authors}</div>
                <div className="muted">{p.venue}</div>
                <a className="link" href={p.url} target="_blank" rel="noreferrer">Link</a>
                <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "14px 0" }} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Grants & Funding (selected)">
        <div className="stack">
          {grantsSorted.slice(0, 5).map((g) => (
            <Card key={`${g.title}-${g.year}`}>
              <div className="small">{g.year} • {g.amount}</div>
              <h3>{g.title}</h3>
              <div className="muted">Role: {g.role}</div>
              <div className="muted">Source: {g.source}</div>
              {g.partner ? <div className="muted">Partner: {g.partner}</div> : null}
            </Card>
          ))}
          <div>
            <Link className="link" to="/grants">View all grants →</Link>
          </div>
        </div>
      </Section>
    </Container>
  );
}

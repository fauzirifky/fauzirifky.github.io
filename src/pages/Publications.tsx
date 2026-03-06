import Container from "../components/layout/Container";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { cvData } from "../data/cv";

export default function Publications() {
  const { publications, books } = cvData;
  const pubs = [...publications].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  return (
    <Container>
      <div className="pageHeader">
        <h1>Publications</h1>
        <p className="muted">Journal articles, proceedings, and related outputs.</p>
      </div>

      <Section title="Publications">
        <div className="stack">
          {pubs.map((p) => (
            <Card key={p.url}>
              <div className="small">{p.year ?? ""}</div>
              <h3>{p.title}</h3>
              <div className="muted">{p.authors}</div>
              <div className="muted">{p.venue}</div>
              <a className="link" href={p.url} target="_blank" rel="noreferrer">Link</a>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Books">
        <div className="grid">
          {books.map((b) => (
            <Card key={b.title}>
              <h3>{b.title}</h3>
              <div className="muted">{b.authors}</div>
              <div className="small">{b.meta}</div>
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}

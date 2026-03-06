import Container from "../components/layout/Container";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import { cvData } from "../data/cv";

export default function Grants() {
  const { grants } = cvData;
  const sorted = [...grants].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <Container>
      <div className="pageHeader">
        <h1>Grants & Funding</h1>
        <p className="muted">Research grants, funding, and partnerships.</p>
      </div>

      <Section title="Grants">
        <div className="stack">
          {sorted.map((g) => (
            <Card key={`${g.title}-${g.year}`}>
              <div className="small">{g.year} • {g.amount}</div>
              <h3>{g.title}</h3>
              <div className="muted">Role: {g.role}</div>
              <div className="muted">Source: {g.source}</div>
              {g.partner ? <div className="muted">Partner: {g.partner}</div> : null}
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}

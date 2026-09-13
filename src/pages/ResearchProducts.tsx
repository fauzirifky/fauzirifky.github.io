import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Container from "../components/layout/Container";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import TagList from "../components/ui/TagList";
import { cvData } from "../data/cv";
import { slugify } from "../components/ui/slug";

export default function ResearchProducts() {
  const location = useLocation();
  useEffect(() => {
    const id = window.location.hash?.replace("#", "");
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  const { researchProducts } = cvData;

  return (
    <Container>
      <div className="pageHeader">
        <h1>Research Products</h1>
        <p className="muted">Decision support systems and research software built from applied research collaborations.</p>
      </div>

      <Section title="Products">
        <div className="grid">
          {researchProducts.map((p) => (
            <Card key={p.name}>
              <div id={slugify(p.name)} />
              <h3>{p.name}</h3>
              <div className="small">{p.category}</div>
              <p>{p.description}</p>
              {p.challenge && <p><strong>Tantangan:</strong> {p.challenge}</p>}
              {p.readiness && <p className="small">{p.readiness}</p>}
              {p.partners && <p><strong>Potensi mitra:</strong> {p.partners}</p>}
              {p.commercialization && <p><strong>Skema kerja sama:</strong> {p.commercialization}</p>}
              {p.featuredImage ? (
                <div className="productMedia">
                  <img src={p.featuredImage} alt={`${p.name} screenshot`} />
                </div>
              ) : null}
              {p.collaborators?.length ? <div className="small" style={{ marginTop: 8 }}>Inventor / Tim: {p.collaborators.join(", ")}</div> : null}
              {p.links?.length ? (
                <div className="row" style={{ marginTop: 8 }}>
                  {p.links.map((l) => (
                    <a key={l.url} className="link" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                  ))}
                </div>
              ) : null}
              {!p.links?.length && <p className="small">Demo publik belum tersedia.</p>}
              <TagList tags={p.tags} />
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}

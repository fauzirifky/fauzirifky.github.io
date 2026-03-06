import { useEffect } from "react";
import Container from "../components/layout/Container";
import Section from "../components/ui/Section";
import Card from "../components/ui/Card";
import TagList from "../components/ui/TagList";
import { cvData } from "../data/cv";
import { slugify } from "../components/ui/slug";

export default function ResearchProducts() {
  useEffect(() => {
    const id = window.location.hash?.replace("#", "");
    if (!id) return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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
            <Card key={p.name} className={p.links?.[0]?.url && p.links?.[0]?.url !== "#" ? "card--click" : undefined} role={p.links?.[0]?.url && p.links?.[0]?.url !== "#" ? "link" : undefined} tabIndex={p.links?.[0]?.url && p.links?.[0]?.url !== "#" ? 0 : undefined} onClick={() => { const u = p.links?.[0]?.url; if (u && u !== "#") window.open(u, "_blank", "noreferrer"); }} onKeyDown={(e) => { const u = p.links?.[0]?.url; if (e.key === "Enter" && u && u !== "#") window.open(u, "_blank", "noreferrer"); }}>
              <div id={slugify(p.name)} />
              <h3>{p.name}</h3>
              <div className="small">{p.category}</div>
              <p>{p.description}</p>
              {p.featuredImage ? (
                <div className="productMedia">
                  <img src={p.featuredImage} alt={`${p.name} screenshot`} />
                </div>
              ) : null}
              {p.collaborators?.length ? <div className="small" style={{ marginTop: 8 }}>Collaborators: {p.collaborators.join(", ")}</div> : null}
              {p.links?.length ? (
                <div className="row" style={{ marginTop: 8 }}>
                  {p.links.map((l) => (
                    <a key={l.url} className="link" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                  ))}
                </div>
              ) : null}
              <TagList tags={p.tags} />
            </Card>
          ))}
        </div>
      </Section>

      <p className="small">Tip: Put product images in <code>public/products/</code> and set <code>featuredImage</code> in <code>src/data/cv.ts</code>.</p>
    </Container>
  );
}

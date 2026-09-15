import Container from "../components/layout/Container";
import Card from "../components/ui/Card";
import Section from "../components/ui/Section";
import { cvData } from "../data/cv";
import { featuredCourses } from "../data/courses";
import publicationData from "../data/publications.json";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const {
    person,
    currentPosition,
    education,
    certifications,
    researchProducts,
    skills,
    grants,
    sidebarSkills,
  } = cvData;

  const pubsSorted = [...publicationData].sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0),
  );
  const grantsSorted = [...grants].sort(
    (a, b) => Number(b.year) - Number(a.year),
  );

  return (
    <Container>
      <section className="heroStripe">
        <div className="heroStripe__copy">
          <div className="eyebrow">Applied Mathematics · Computational Modeling</div>
          <h1>{person.name}</h1>
          <p className="heroStripe__lead">
            {currentPosition.position} — {currentPosition.department},{" "}
            {currentPosition.institution}
          </p>

          <div className="heroStripe__meta">
            <span>{person.location}</span>
            <a href={`mailto:${person.email}`}>{person.email}</a>
            <a
              href={`https://orcid.org/${person.orcid}`}
              target="_blank"
              rel="noreferrer"
            >
              ORCID {person.orcid}
            </a>
          </div>

          <div className="heroStripe__actions">
            <Link className="stripeBtn stripeBtn--primary" to="/research-products">
              Research products <span aria-hidden="true">→</span>
            </Link>
            <Link className="stripeBtn stripeBtn--secondary" to="/teaching">
              Teaching
            </Link>
          </div>
        </div>

        <div className="heroStripe__visual">
          <div className="heroStripe__photo">
            <img
              src={`${import.meta.env.BASE_URL}${(person.photoPath ?? "").replace(/^\/+/, "")}`}
              alt={`${person.name} portrait`}
            />
          </div>

          <div className="heroStripe__education">
            <div className="microLabel">Education</div>
            {education.map((item) => (
              <div className="educationLine" key={item.degree}>
                <strong>{item.degree.replace(" in Mathematics", "")}</strong>
                <span>{item.institution} · {item.year}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="homeBento">
        <Card className="homePanel homePanel--cert">
          <div className="microLabel">Credentials</div>
          <h2>Certifications</h2>
          <div className="compactRows">
            {certifications.map((cert) => (
              <div className="compactRow" key={cert.name}>
                <strong>{cert.name}</strong>
                <span>{cert.date}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="homePanel homePanel--products">
          <div className="microLabel">Applied research</div>
          <div className="panelHeadingRow">
            <h2>Research Products</h2>
            <Link className="arrowLink" to="/research-products">
              View all →
            </Link>
          </div>

          <div className="productMiniGrid">
            {researchProducts.slice(0, 4).map((product) => (
              <Link
                to={`/research-products#${product.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")}`}
                className="productMini"
                key={product.name}
              >
                <span className="productMini__name">{product.name}</span>
                <span className="productMini__meta">{product.category}</span>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="homePanel homePanel--expertise">
          <div className="microLabel">Expertise</div>
          <h2>Research & Computational Skills</h2>

          <div className="expertiseList">
            {sidebarSkills.map((group) => (
              <div className="expertiseGroup" key={group.title}>
                <strong>{group.title}</strong>
                <p>{group.items.join(", ")}</p>
              </div>
            ))}
          </div>

          <div className="languageLine">
            <span className="microLabel">Languages</span>
            <span>{skills.languages.join(" · ")}</span>
          </div>
        </Card>

        <Card className="homePanel homePanel--teaching">
          <div className="microLabel">Current teaching</div>
          <div className="panelHeadingRow">
            <h2>Courses</h2>
            <Link className="arrowLink" to="/teaching">
              All courses →
            </Link>
          </div>

          <div className="courseCompactList">
            {featuredCourses.slice(0, 6).map((course) => (
              <button
                type="button"
                className="courseCompact"
                key={course.slug}
                onClick={() => navigate(`/teaching/${course.slug}`)}
              >
                <span>
                  <strong>{course.title}</strong>
                  <small>{course.titleEn}</small>
                </span>
                <span className="courseCompact__meta">
                  {course.code || ""}
                  {course.credits ? ` · ${course.credits} SKS` : ""}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Section
        title="Selected Publications"
        right={<Link className="arrowLink" to="/publications">All publications →</Link>}
      >
        <div className="publicationGrid">
          {pubsSorted.slice(0, 6).map((publication) => (
            <a
              className="publicationCard"
              href={publication.url}
              target="_blank"
              rel="noreferrer"
              key={publication.url}
            >
              <div className="publicationCard__year">{publication.year}</div>
              <h3>{publication.title}</h3>
              <p>{publication.venue}</p>
              <span className="arrowLink">Open publication →</span>
            </a>
          ))}
        </div>
      </Section>

      <Section
        title="Selected Grants & Funding"
        right={<Link className="arrowLink" to="/grants">All grants →</Link>}
      >
        <div className="grantGrid">
          {grantsSorted.slice(0, 4).map((grant) => (
            <Card className="grantCard" key={`${grant.title}-${grant.year}`}>
              <div className="grantCard__meta">
                <span>{grant.year}</span>
                <span>{grant.amount}</span>
              </div>
              <h3>{grant.title}</h3>
              <p>{grant.role} · {grant.source}</p>
              {grant.partner ? <div className="small">Partner: {grant.partner}</div> : null}
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}

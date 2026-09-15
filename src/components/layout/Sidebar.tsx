import { cvData } from "../../data/cv";
import IconLink from "../ui/IconLink";
import { MailIcon, OrcidIcon, GithubIcon, LinkedinIcon } from "../ui/Icons";

export default function Sidebar() {
  const { person, education, certifications, sidebarSkills } = cvData;

  return (
    <aside className="sidebar">
      <div className="sidebar__inner">
        <div className="sidebar__profile">
          <div className="sidebar__name">{person.name}</div>
          <div className="sidebar__title">{person.title}</div>
          <div className="sidebar__meta">{person.location}</div>

          <div className="sidebar__links" aria-label="Social links">
            <IconLink href={`mailto:${person.email}`} title="Email"><MailIcon /></IconLink>
            <IconLink href={`https://orcid.org/${person.orcid}`} title="ORCID"><OrcidIcon /></IconLink>
            <IconLink href={person.github.url} title="GitHub"><GithubIcon /></IconLink>
            <IconLink href={person.linkedin.url} title="LinkedIn"><LinkedinIcon /></IconLink>
          </div>
        </div>

        <section className="sidebar__section">
          <div className="sidebar__h">Education</div>
          <div className="sidebar__education">
            {education.slice(0, 3).map((item) => (
              <div className="sidebar__educationItem" key={item.degree}>
                <strong>{item.degree.replace(" in Mathematics", "")}</strong>
                <span>{item.institution} · {item.year}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="sidebar__section sidebar__section--skills">
          <div className="sidebar__h">Expertise</div>
          <div className="sidebar__skillsCompact">
            {sidebarSkills.map((group) => (
              <div className="sidebar__skillCompact" key={group.title}>
                <strong>{group.title}</strong>
                <span>{group.items.join(" · ")}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="sidebar__section sidebar__section--certs">
          <div className="sidebar__h">Certifications</div>
          <div className="sidebar__certs">
            {certifications.map((cert) => (
              <div className="sidebar__cert" key={cert.name}>
                <strong>{cert.name}</strong>
                <span>{cert.date}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
}

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

          <div className="sidebar__links" aria-label="social links">
            <IconLink href={`mailto:${person.email}`} title="Email">
              <MailIcon />
            </IconLink>
            <IconLink href={`https://orcid.org/${person.orcid}`} title="ORCID">
              <OrcidIcon />
            </IconLink>
            <IconLink href={person.github.url} title="GitHub">
              <GithubIcon />
            </IconLink>
            <IconLink href={person.linkedin.url} title="LinkedIn">
              <LinkedinIcon />
            </IconLink>
          </div>
        </div>

        <div className="sidebar__section">
          <div className="sidebar__h">Profile & Education</div>
          <ul className="sidebar__list">
            {education.slice(0, 3).map((e) => (
              <li key={e.degree}>
                <div className="sidebar__itemTitle">{e.degree}</div>
                <div className="sidebar__itemMeta">
                  {e.institution} · {e.year}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="sidebar__section">
          <div className="sidebar__h">Skills</div>
          {sidebarSkills?.map((g) => (
            <div key={g.title} className="sidebar__skillGroup">
              <div className="sidebar__skillTitle">{g.title}</div>
              <div className="sidebar__chips">
                {g.items.map((it) => (
                  <span key={it} className="chip chip--dark">
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar__section">
          <div className="sidebar__h">Certifications</div>
          <ul className="sidebar__list">
            {certifications.map((c) => (
              <li key={c.name}>
                <div className="sidebar__itemTitle">{c.name}</div>
                <div className="sidebar__itemMeta">{c.issuer}</div>
                <div className="sidebar__itemMeta">{c.date}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

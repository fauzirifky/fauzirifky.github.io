import { NavLink } from "react-router-dom";
import Container from "./Container";
import CVDownloadButton from "../cv/CVDownloadButton";
import IconLink from "../ui/IconLink";
import { MailIcon, OrcidIcon, GithubIcon, LinkedinIcon } from "../ui/Icons";
import { cvData } from "../../data/cv";
import ProductsDropdown from "./ProductsDropdown";

export default function Navbar() {
  const { person } = cvData;

  return (
    <header className="nav">
      <Container className="nav__inner">
        <div className="nav__brand">
          <NavLink to="/" className="nav__logo">
            Rifky Fauzi
          </NavLink>
          <div className="nav__subtitle">Department of Mathematics • Institut Teknologi Sumatera</div>
        </div>

        <nav className="nav__links">
          <ProductsDropdown />
          <NavLink to="/teaching" className={({ isActive }) => (isActive ? "active" : "")} end>
            Teaching
          </NavLink>
          <NavLink to="/publications" className={({ isActive }) => (isActive ? "active" : "")} end>
            Publications
          </NavLink>
          <NavLink to="/grants" className={({ isActive }) => (isActive ? "active" : "")} end>
            Grants
          </NavLink>
        </nav>

        <div className="nav__right">
          <div className="iconRow" aria-label="social links">
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
          <CVDownloadButton />
        </div>
      </Container>
    </header>
  );
}

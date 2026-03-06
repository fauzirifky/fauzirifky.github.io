import Container from "./Container";

export default function Footer() {
  return (
    <footer className="footer">
      <Container className="footer__inner">
        <div>© {new Date().getFullYear()} Rifky Fauzi</div>
        <div>Academic CV • Vite + React</div>
      </Container>
    </footer>
  );
}

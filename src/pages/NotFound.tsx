import { Link } from "react-router-dom";
import Container from "../components/layout/Container";

export default function NotFound() {
  return (
    <Container>
      <div className="pageHeader">
        <h1>404</h1>
        <p className="muted">Page not found.</p>
        <Link className="link" to="/">Back to home</Link>
      </div>
    </Container>
  );
}

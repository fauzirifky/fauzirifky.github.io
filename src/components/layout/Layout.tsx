import type { ReactNode } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Container from "./Container";

export default function Layout({ children }: { children?: ReactNode }) {
  const location = useLocation();

  const inTeachingDetail = location.pathname.startsWith("/teaching/");
  const backTarget = inTeachingDetail ? "/teaching" : "/";
  const backLabel = inTeachingDetail ? "Kembali ke Teaching" : "Kembali ke Home";

  return (
    <div className="appShell">
      <Sidebar />
      <div className="appMain">
        <Navbar />
        <main className="main">
          <Container className="backBar">
            <Link className="backPill" to={backTarget}>
              <span aria-hidden="true">←</span> {backLabel}
            </Link>
          </Container>
          {children ?? <Outlet />}
        </main>
        <Footer />
      </div>
    </div>
  );
}

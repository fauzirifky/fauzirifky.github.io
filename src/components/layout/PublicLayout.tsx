import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="appMain">
      <Navbar />
      <main className="main">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
}

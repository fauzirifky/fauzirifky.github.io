import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }: { children?: ReactNode }) {
  return (
    <div className="appShell">
      <Sidebar />
      <div className="appMain">
        <Navbar />
        <main className="main">
          {children ?? <Outlet />}
        </main>
        <Footer />
      </div>
    </div>
  );
}

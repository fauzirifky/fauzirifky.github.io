import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="appShell">
      <Sidebar />
      <div className="appMain">
        <Navbar />
        <main className="main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}

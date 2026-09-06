import { useLocation } from "react-router-dom";
import PublicLayout from "../components/layout/PublicLayout";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import Teaching from "../pages/Teaching";
import TeachingDetail from "../pages/TeachingDetail";
import Publications from "../pages/Publications";
import Grants from "../pages/Grants";
import ResearchProducts from "../pages/ResearchProducts";
import NotFound from "../pages/NotFound";
import { getCourse } from "../data/courses";

function cleanPath(pathname: string) {
  const cleaned = pathname
    .replace(/\/index\.html$/i, "")
    .replace(/\/+$/, "");

  return cleaned || "/";
}

export default function PathRouter() {
  const location = useLocation();
  const path = cleanPath(location.pathname);

  if (path === "/") {
    return (
      <PublicLayout>
        <Home />
      </PublicLayout>
    );
  }

  if (path === "/teaching") {
    return (
      <Layout>
        <Teaching />
      </Layout>
    );
  }

  if (path.startsWith("/teaching/")) {
    const slug = path.slice("/teaching/".length);

    if (getCourse(slug)) {
      return (
        <Layout>
          <TeachingDetail forcedSlug={slug} />
        </Layout>
      );
    }

    return (
      <Layout>
        <NotFound />
      </Layout>
    );
  }

  if (path === "/publications") {
    return (
      <Layout>
        <Publications />
      </Layout>
    );
  }

  if (path === "/grants") {
    return (
      <Layout>
        <Grants />
      </Layout>
    );
  }

  if (path === "/research-products") {
    return (
      <Layout>
        <ResearchProducts />
      </Layout>
    );
  }

  return (
    <Layout>
      <NotFound />
    </Layout>
  );
}

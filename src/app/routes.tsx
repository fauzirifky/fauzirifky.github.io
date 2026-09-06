import { Route, Routes as RouterRoutes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PublicLayout from "../components/layout/PublicLayout";
import Home from "../pages/Home";
import ResearchProducts from "../pages/ResearchProducts";
import Teaching from "../pages/Teaching";
import TeachingDetail from "../pages/TeachingDetail";
import Publications from "../pages/Publications";
import Grants from "../pages/Grants";
import NotFound from "../pages/NotFound";
import { courses, courseAliases } from "../data/courses";

export const Routes = (
  <RouterRoutes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
    </Route>

    <Route element={<Layout />}>
      <Route path="/research-products" element={<ResearchProducts />} />
      <Route path="/teaching" element={<Teaching />} />

      {courses.map((course) => (
        <Route
          key={course.slug}
          path={`/teaching/${course.slug}`}
          element={<TeachingDetail forcedSlug={course.slug} />}
        />
      ))}

      {Object.entries(courseAliases).map(([alias, canonical]) => (
        <Route
          key={alias}
          path={`/teaching/${alias}`}
          element={<TeachingDetail forcedSlug={canonical} />}
        />
      ))}

      <Route path="/teaching/:slug" element={<TeachingDetail />} />
      <Route path="/publications" element={<Publications />} />
      <Route path="/grants" element={<Grants />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </RouterRoutes>
);

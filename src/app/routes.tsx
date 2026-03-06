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

export const Routes = (
  <RouterRoutes>
    {/* Landing (no sidebar) */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
    </Route>

    {/* Pages (with sidebar) */}
    <Route element={<Layout />}>
      <Route path="/research-products" element={<ResearchProducts />} />
      <Route path="/teaching" element={<Teaching />} />
      <Route path="/teaching/:slug" element={<TeachingDetail />} />
      <Route path="/publications" element={<Publications />} />
      <Route path="/grants" element={<Grants />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </RouterRoutes>
);

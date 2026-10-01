import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Header from "./components/Header";
import SiteFooter from "./components/SiteFooter";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Development = lazy(() => import("./pages/Development"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function RouteEffects() {
  const { pathname, key } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const page =
      pathname === "/"
        ? "APEX 2025 winner"
        : pathname === "/dashboard"
          ? "Flight replay"
          : pathname === "/development"
            ? "Engineering"
            : "Balloon telemetry";
    document.title = `SkyCell · ${page}`;
  }, [pathname, key]);
  return null;
}

const App = () => (
  <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <RouteEffects />
      <div className="min-h-screen relative">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" tabIndex={-1}>
          <Suspense
            fallback={
              <div
                className="container mx-auto min-h-[65vh] px-6 pt-36"
                role="status"
              >
                Loading mission view…
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/development" element={<Development />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  </MotionConfig>
);

export default App;

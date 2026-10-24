import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import NotFound from "./pages/NotFound";
import ExperienceHeader from "./experience/ExperienceHeader";
import "./experience/experience.css";

const Development = lazy(() => import("./pages/Development"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SkyCellExperience = lazy(() => import("./experience/SkyCellExperience"));

function RouteEffects() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    let observer: MutationObserver | undefined;
    if (hash) {
      let anchor = hash.slice(1);
      try { anchor = decodeURIComponent(anchor); } catch { /* Keep a malformed hash literal. */ }
      const scroll = () => {
        const target = document.getElementById(anchor);
        if (!target) return false;
        target.scrollIntoView({ behavior: "instant" });
        observer?.disconnect();
        return true;
      };
      if (!scroll()) {
        observer = new MutationObserver(scroll);
        observer.observe(document.getElementById("root")!, { childList: true, subtree: true });
      }
    } else window.scrollTo({ top: 0, behavior: "instant" });
    const page =
      pathname === "/"
        ? "A network above the clouds"
        : pathname === "/dashboard"
          ? "Flight replay"
          : pathname === "/development"
            ? "Engineering"
            : "Balloon telemetry";
    document.title = `SkyCell · ${page}`;
    return () => observer?.disconnect();
  }, [pathname, hash, key]);
  return null;
}

function PageViews() {
  const { pathname } = useLocation();
  const home = pathname === "/";
  return (
    <div className={home ? "sky-page" : "sky-legacy"}>
      <a href="#main-content" className="sky-skip">Skip to content</a>
      <ExperienceHeader />
      <main id="main-content" tabIndex={-1} className="sky-page-main">
        <Suspense fallback={<div className="sky-page-loading" role="status">Opening SkyCell…</div>}>
          <Routes>
            <Route path="/" element={<SkyCellExperience />} />
            <Route path="/development" element={<Development />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!home && <footer className="sky-legacy-footer"><Link to="/">SkyCell · Back to the ascent</Link><span>APEX 2025 · Mission archive</span></footer>}
    </div>
  );
}

const App = () => (
  <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <RouteEffects />
      <PageViews />
    </BrowserRouter>
  </MotionConfig>
);

export default App;

import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Header from "./components/Header";
import SiteFooter from "./components/SiteFooter";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DraftHub from "./drafts/DraftHub";
import DraftFrame from "./drafts/DraftFrame";

const Development = lazy(() => import("./pages/Development"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MissionDraft = lazy(() => import("./drafts/MissionDraft"));
const AscentDraft = lazy(() => import("./drafts/AscentDraft"));
const ExplorerDraft = lazy(() => import("./drafts/ExplorerDraft"));

function RouteEffects() {
  const { pathname, hash, key } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: "instant" });
    const page =
      pathname === "/"
        ? "Design drafts"
        : pathname.startsWith("/drafts/")
          ? `Draft ${pathname.endsWith("mission") ? "1 · Mission story" : pathname.endsWith("ascent") ? "2 · Scroll ascent" : "3 · Explorer"}`
        : pathname === "/dashboard"
          ? "Flight replay"
          : pathname === "/development"
            ? "Engineering"
            : "Balloon telemetry";
    document.title = `SkyCell · ${page}`;
  }, [pathname, hash, key]);
  return null;
}

function SiteViews() {
  const { pathname } = useLocation();
  const draftView = pathname === "/" || pathname.startsWith("/drafts/");
  if (draftView) {
    return (
      <DraftFrame>
        <Suspense fallback={<p className="draft-loading" role="status">Loading draft…</p>}>
          <Routes>
            <Route path="/" element={<DraftHub />} />
            <Route path="/drafts/mission" element={<MissionDraft />} />
            <Route path="/drafts/ascent" element={<AscentDraft />} />
            <Route path="/drafts/explorer" element={<ExplorerDraft />} />
            <Route path="*" element={<DraftHub />} />
          </Routes>
        </Suspense>
      </DraftFrame>
    );
  }
  return (
    <div className="min-h-screen relative">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-primary-foreground">Skip to content</a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Suspense fallback={<div className="container mx-auto min-h-[65vh] px-6 pt-36" role="status">Loading mission view…</div>}>
          <Routes>
            <Route path="/original" element={<Index />} />
            <Route path="/development" element={<Development />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}

const App = () => (
  <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <RouteEffects />
      <SiteViews />
    </BrowserRouter>
  </MotionConfig>
);

export default App;

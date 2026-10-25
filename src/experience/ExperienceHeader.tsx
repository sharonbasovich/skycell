import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function ExperienceHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);
  return (
    <header className={`sky-header${scrolled || pathname !== "/" ? " sky-header-solid" : ""}`}>
      <Link className="sky-brand" to="/" aria-label="SkyCell home">
        <svg viewBox="0 0 26 32" fill="none" aria-hidden="true"><circle cx="13" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M13 14v10m-4 3H5" stroke="currentColor" strokeWidth="1.5" /><rect x="9" y="24" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>
        SkyCell
      </Link>
      <nav aria-label="Main navigation">
        <Link to="/#ascent">Ascent</Link>
        <Link to="/#hardware">Build</Link>
        <Link className="sky-nav-replay" to="/dashboard">Flight replay <ArrowUpRight size={14} aria-hidden="true" /></Link>
      </nav>
    </header>
  );
}

import { Link, useLocation } from "react-router-dom";
import type { MouseEvent } from "react";

export default function ExperienceHeader() {
  const { pathname } = useLocation();
  const travel = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (pathname !== "/" || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const anchor = document.getElementById(id);
    if (!anchor) return;
    event.preventDefault();
    window.scrollTo({ top: anchor.getBoundingClientRect().top + scrollY, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return (
    <header className={`sky-header${pathname !== "/" ? " sky-header-solid" : ""}`}>
      <Link className="sky-brand" to="/" aria-label="SkyCell home">
        <svg viewBox="0 0 26 32" fill="none" aria-hidden="true"><circle cx="13" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" /><path d="M13 14v10m-4 3H5" stroke="currentColor" strokeWidth="1.5" /><rect x="9" y="24" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>
        SkyCell
      </Link>
      <nav aria-label="Main navigation">
        <Link to="/#ascent" onClick={event => travel(event, "ascent")}>Flight</Link>
        <Link to="/#hardware" onClick={event => travel(event, "hardware")}>Payload</Link>
        <Link to="/#flight-archive" onClick={event => travel(event, "flight-archive")}>Recording</Link>
      </nav>
    </header>
  );
}

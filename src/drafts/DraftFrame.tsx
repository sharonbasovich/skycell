import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { draftDirections } from "./directions";
import "./drafts.css";

export default function DraftFrame({ children }: { children: ReactNode }) {
  return (
    <div className="draft-frame">
      <a className="draft-skip" href="#draft-content">Skip to draft</a>
      <header className="draft-bar">
        <Link to="/" className="draft-home">SkyCell <span>drafts</span></Link>
        <nav aria-label="Compare design drafts">
          {draftDirections.map((draft) => (
            <NavLink key={draft.path} to={draft.path} className={({ isActive }) => `draft-tab${isActive ? " is-active" : ""}`}>
              <span>{draft.number}</span><span>{draft.short}</span>
            </NavLink>
          ))}
        </nav>
        <span className="draft-stage">Early comparison</span>
      </header>
      <main id="draft-content" tabIndex={-1}>{children}</main>
    </div>
  );
}

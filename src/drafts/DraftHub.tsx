import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { draftDirections } from "./directions";

function DirectionVisual({ number }: { number: string }) {
  if (number === "1") return <div className="draft-visual draft-visual-photo"><img src="/gallery/PXL_20250621_172905846.MP.jpg" alt="Actual APEX balloon train rising into a blue sky" /><span>A network above<br />the clouds.</span></div>;
  if (number === "2") return <div className="draft-visual draft-visual-ascent" aria-hidden="true"><div className="draft-altitude">30 km<span>Stratosphere</span></div><div className="draft-balloon"><i /><b /></div><div className="draft-horizon" /><span>Follow the ascent.</span></div>;
  return <div className="draft-visual draft-visual-explorer" aria-hidden="true"><div className="draft-mini-header">Archived APEX / SondeHub flight</div><svg viewBox="0 0 400 150"><path d="M20 120H380M20 75H380M20 30H380" stroke="#d0dce5" fill="none" /><path d="M20 102L58 91L93 80M154 58L183 48L220 38L255 26M285 34L302 82L330 115L380 136" stroke="#267dd2" strokeWidth="3" fill="none" /><path d="M245 10V145" stroke="#132e48" strokeDasharray="4 4" /></svg><div className="draft-mini-timeline"><span /> Play the archive</div></div>;
}

export default function DraftHub() {
  return (
    <div className="draft-hub">
      <section className="draft-intro">
        <h1>One mission.<br />Three directions.</h1>
        <div><p>Three early SkyCell drafts to compare the page structure, visual character, and motion. Each uses the real project story and the same archived flight data.</p><p className="draft-intro-note">Choose a direction or borrow parts from each. These are working sketches; the detailed polish comes after your choice.</p></div>
      </section>
      <section className="draft-directions" aria-label="Three design directions">
        {draftDirections.map((draft) => (
          <Link to={draft.path} className="draft-direction" key={draft.path}>
            <DirectionVisual number={draft.number} />
            <div className="draft-direction-copy"><span className="draft-number">{draft.number}</span><div><h2>{draft.title}</h2><p>{draft.description}</p><span className="draft-open">Open draft <ArrowUpRight size={16} aria-hidden="true" /></span></div></div>
          </Link>
        ))}
      </section>
      <footer className="draft-hub-footer"><p>SkyCell · APEX 2025 · Design comparison</p><a href="https://skycell.vercel.app/" target="_blank" rel="noreferrer">View current public site <ArrowUpRight size={14} /></a></footer>
    </div>
  );
}

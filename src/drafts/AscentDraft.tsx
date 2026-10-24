import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Radio } from "lucide-react";
import "./ascent.css";

const stages = [
  {
    id: "ground",
    altitude: "On the ground",
    title: "Start with a small radio.",
    body: "SkyCell explored whether an affordable mesh radio could connect a balloon payload to people far below. Four students brought the hardware, flight software, and ground tools together for APEX 2025.",
    detail: "915 MHz LoRa / Meshtastic",
  },
  {
    id: "link",
    altitude: "Across the radio link",
    title: "Keep the conversation going.",
    body: "Python software handled NMEA GPS data, environmental sensors, and reconnection. Ground tools decoded and logged the packets, while RTL-SDR sweeps explored the surrounding radio spectrum.",
    detail: "30 MHz–1.5 GHz sweeps at 2.4 MS/s",
  },
  {
    id: "stratosphere",
    altitude: "Into the stratosphere",
    title: "A much bigger horizon.",
    body: "The mission reached approximately 30 km altitude and established a 70 km radio link. The team won first place at the APEX international research hackathon. Power interruptions and a small number of received payload packets left clear work for the next iteration.",
    detail: "≈30 km mission altitude / 70 km radio link",
  },
];

function AscentDiagram({ progress }: { progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const reduceMotion = useReducedMotion();
  const balloonX = useTransform(progress, [0, 0.5, 1], ["30%", "52%", "67%"]);
  const balloonY = useTransform(progress, [0, 0.5, 1], ["65%", "39%", "12%"]);
  const beamX = useTransform(progress, [0, 0.5, 1], [330, 550, 700]);
  const beamY = useTransform(progress, [0, 0.5, 1], [525, 330, 130]);
  const atmosphere = useTransform(progress, [0, 1], [0.15, 0.65]);

  return (
    <div className="ascent-diagram" role="img" aria-label="Conceptual illustration of a balloon rising above a ground radio. Not a recorded flight path and not to scale.">
      <div className="ascent-diagram-title">Ground to stratosphere</div>
      <div className="ascent-height ascent-height-top">≈30 km</div>
      <div className="ascent-height ascent-height-mid">15 km</div>
      <div className="ascent-height ascent-height-bottom">Ground</div>
      <div className="ascent-guide ascent-guide-top" />
      <div className="ascent-guide ascent-guide-mid" />
      <motion.div className="ascent-atmosphere" style={{ opacity: reduceMotion ? 0.4 : atmosphere }} />
      <svg className="ascent-radio-beam" viewBox="0 0 1000 750" preserveAspectRatio="none" aria-hidden="true">
        <motion.line x1="220" y1="665" x2={reduceMotion ? 700 : beamX} y2={reduceMotion ? 130 : beamY} stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 9" />
      </svg>
      <motion.div className="ascent-balloon" style={{ left: reduceMotion ? "67%" : balloonX, top: reduceMotion ? "12%" : balloonY }} aria-hidden="true">
        <svg viewBox="0 0 100 148" fill="none">
          <path d="M50 5C24 5 8 25 8 49c0 27 23 45 37 57h10c14-12 37-30 37-57C92 25 76 5 50 5Z" fill="#edf4ff" />
          <path d="M50 5C33 14 27 34 29 53c2 20 13 38 21 53" stroke="#a8c9f6" strokeWidth="1.5" />
          <path d="M50 5c17 9 23 29 21 48-2 20-13 38-21 53" stroke="#a8c9f6" strokeWidth="1.5" />
          <path d="M45 106h10l-3 8h-4l-3-8Z" fill="#b4d0f6" />
          <path d="M50 114v15" stroke="#edf4ff" strokeWidth="1.5" />
          <rect x="40" y="129" width="20" height="14" rx="2" fill="#edf4ff" />
          <path d="M53 129v-6" stroke="#edf4ff" strokeWidth="1.5" />
        </svg>
      </motion.div>
      <div className="ascent-earth" aria-hidden="true" />
      <div className="ascent-station" aria-hidden="true"><Radio size={30} strokeWidth={1.5} /><span>Ground station</span></div>
      <div className="ascent-concept-note">Conceptual view · not to scale<br />Scroll position is not telemetry.</div>
    </div>
  );
}

export default function AscentDraft() {
  const storyRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const reduceMotion = useReducedMotion();

  return (
    <div className={`ascent-draft${reduceMotion ? " ascent-reduced" : ""}`}>
      <header className="ascent-header">
        <Link to="/drafts/ascent" className="ascent-wordmark" aria-label="SkyCell ascent draft home">SkyCell</Link>
        <nav aria-label="Ascent draft navigation">
          <a href="#ascent-story">The ascent</a>
          <a href="#ascent-field">In the field</a>
          <Link to="/dashboard">Flight replay <ArrowUpRight size={15} /></Link>
        </nav>
      </header>

      <section className="ascent-hero">
        <div className="ascent-hero-main">
          <h1>A small radio.<br />A much bigger<br />horizon.</h1>
          <p>A student-built communications experiment, from the workbench to the stratosphere.</p>
          <a className="ascent-text-link" href="#ascent-story">Follow the ascent <ArrowDown size={18} /></a>
        </div>
        <div className="ascent-hero-side">
          <svg viewBox="0 0 300 300" aria-hidden="true" className="ascent-hero-orbit">
            <circle cx="150" cy="150" r="116" />
            <circle cx="150" cy="150" r="77" />
            <circle cx="150" cy="150" r="39" />
            <path d="M34 150h232M150 34v232" />
            <path d="M150 150 226 61" className="ascent-hero-vector" />
            <circle cx="226" cy="61" r="8" className="ascent-hero-point" />
          </svg>
          <p>First place<br /><strong>APEX 2025</strong><br />International research hackathon</p>
        </div>
        <div className="ascent-hero-bottom"><span>Four students. One high-altitude mission.</span><span>June 2025</span></div>
      </section>

      <section ref={storyRef} id="ascent-story" className="ascent-story" aria-label="How the SkyCell system works">
        <div className="ascent-scene-column"><AscentDiagram progress={scrollYProgress} /></div>
        <div className="ascent-chapters">
          {stages.map((stage, index) => (
            <article key={stage.id} id={`ascent-${stage.id}`} className="ascent-chapter">
              <p className="ascent-stage-label"><span>{index + 1}</span>{stage.altitude}</p>
              <h2>{stage.title}</h2>
              <p className="ascent-chapter-body">{stage.body}</p>
              <p className="ascent-chapter-detail">{stage.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="ascent-field" className="ascent-field">
        <div className="ascent-field-heading"><h2>Built here.<br />Flown up there.</h2><p>The real launch and the real hardware behind the schematic.</p></div>
        <div className="ascent-photo-pair">
          <figure className="ascent-launch-photo"><img src="/gallery/PXL_20250621_172905846.MP.jpg" alt="The actual APEX balloon train and its payloads ascending into a blue sky." width="659" height="880" loading="lazy" /><figcaption>APEX balloon train, June 21, 2025</figcaption></figure>
          <figure className="ascent-hardware-photo"><img src="/gallery/1000004195.jpg" alt="SkyCell payload electronics and radio hardware assembled on a workbench." width="800" height="600" loading="lazy" /><figcaption>Payload electronics, power connections, and radio hardware</figcaption><p>Flight hardware and browser visualization are separate parts of the project. The team’s notes preserve what worked, the power brownouts, and the next questions to test.</p><a className="ascent-text-link" href="https://github.com/knivier/SkyCell" target="_blank" rel="noopener noreferrer">Read the flight notes <ArrowUpRight size={17} /></a></figure>
        </div>
      </section>

      <section className="ascent-replay">
        <div><h2>Now follow<br />the recording.</h2><p>The browser replay uses archived APEX tracker / SondeHub observations from June 21, 2025. It is a partial recording, separate from SkyCell’s 915 MHz payload telemetry. It is not a live feed.</p><Link className="ascent-replay-button" to="/dashboard">Open archived flight replay <ArrowUpRight size={19} /></Link></div>
        <dl><div><dt>Archive callsign</dt><dd>APEX-2-T</dd></div><div><dt>Recorded observations</dt><dd>125</dd></div><div><dt>Peak in this partial archive</dt><dd>29,510 m</dd></div><div><dt>Recording window</dt><dd>18:11–19:17 UTC</dd></div></dl>
      </section>

      <footer className="ascent-footer"><Link to="/drafts/ascent" className="ascent-wordmark">SkyCell</Link><p>A team experiment at APEX 2025.</p><div><a href="https://github.com/knivier/SkyCell" target="_blank" rel="noopener noreferrer">Flight & ground source</a><a href="https://github.com/sharonbasovich/skycell" target="_blank" rel="noopener noreferrer">Website source</a></div></footer>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import "./mission.css";

const missionSpecs = [
  ["Radio", "915 MHz LoRa / Meshtastic"],
  ["Flight software", "Python, NMEA GPS and environmental sensors"],
  ["Reliability", "Connection monitoring and reconnection"],
  ["Spectrum study", "RTL-SDR sweeps from 30 MHz to 1.5 GHz at 2.4 MS/s"],
];

export default function MissionDraft() {
  return (
    <div className="mission-draft">
      <header className="mission-header mission-container">
        <a className="mission-wordmark" href="#mission-top" aria-label="SkyCell, back to top">
          <span className="mission-mark" aria-hidden="true"><span /></span>
          SkyCell
        </a>
        <nav aria-label="Mission story">
          <a href="#mission-system">The experiment</a>
          <a href="#mission-journal">Field notes</a>
          <Link to="/dashboard">Flight replay</Link>
        </nav>
      </header>

      <section className="mission-hero mission-container" id="mission-top">
        <div className="mission-hero-copy">
          <h1>A network above the clouds.</h1>
          <p>Four students took a radio experiment into the stratosphere. This is the story of SkyCell.</p>
          <Link className="mission-button" to="/dashboard"><Play size={16} aria-hidden="true" /> Explore the flight archive</Link>
          <a className="mission-text-link" href="#mission-system">Meet the experiment</a>
        </div>
        <figure className="mission-launch-photo">
          <img src="/gallery/PXL_20250621_172905846.MP.jpg" alt="The APEX balloon train, carrying its suspended payloads, rising into a blue sky." width="659" height="880" fetchPriority="high" />
          <figcaption><span>Launch day in Massachusetts</span><span>June 21, 2025</span></figcaption>
        </figure>
      </section>

      <section className="mission-achievement">
        <div className="mission-container mission-achievement-inner">
          <p className="mission-award">1st place<br /><span>at APEX 2025</span></p>
          <p>Built by a team of four students for Hack Club’s international research hackathon.</p>
          <a className="mission-text-link" href="https://github.com/knivier/SkyCell" target="_blank" rel="noreferrer">Read the team’s project</a>
        </div>
      </section>

      <section className="mission-container mission-system" id="mission-system">
        <div className="mission-section-heading">
          <h2>How far can a small radio reach?</h2>
          <p>SkyCell explored whether an affordable balloon-borne node could extend a mesh network. The team brought together a payload, flight software and tools on the ground.</p>
        </div>
        <div className="mission-results">
          <div><strong>≈30 <span>km</span></strong><p>Mission altitude</p></div>
          <div><strong>70 <span>km</span></strong><p>LoRa / Meshtastic radio link</p></div>
          <div className="mission-results-note"><p>A long-range connection was one part of the experiment. The team received only a few payload packets, making power continuity and radio reliability central lessons.</p></div>
        </div>
        <div className="mission-engineering">
          <div>
            <h3>From a GPS reading to the ground.</h3>
            <p>Python software parsed NMEA GPS messages and environmental sensor readings, prepared telemetry, and handled reconnection. Meshtastic radios connected the airborne node to receivers below.</p>
            <Link className="mission-text-link" to="/development">Explore the engineering notes</Link>
          </div>
          <dl>
            {missionSpecs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
        </div>
      </section>

      <section className="mission-journal" id="mission-journal">
        <div className="mission-container">
          <div className="mission-journal-heading"><h2>It started on a workbench.</h2><p>Real hardware. A lot of wiring.<br />Then, a launch weekend in Massachusetts.</p></div>
          <div className="mission-photo-pair">
            <figure>
              <img src="/gallery/PXL_20250611_170737813.MP.jpg" alt="A Raspberry Pi Pico and environmental sensor wired together on a breadboard." width="4032" height="2268" loading="lazy" decoding="async" />
              <figcaption><span>June 2025</span><h3>Start with one reading.</h3><p>A breadboard, a microcontroller and sensors made room to test the software before final assembly.</p></figcaption>
            </figure>
            <figure>
              <img src="/gallery/1000004204.jpg" alt="The insulated SkyCell payload enclosure with its long radio antenna fitted for flight." width="4032" height="3024" loading="lazy" decoding="async" />
              <figcaption><span>Launch preparation</span><h3>Make it ready to fly.</h3><p>The electronics became an insulated payload, with a radio antenna and power system for the trip upward.</p></figcaption>
            </figure>
          </div>
          <details className="mission-flight-lesson">
            <summary>What would the team change for the next flight?</summary>
            <p>The initial buck-converter setup caused brownouts at startup. A power-bank workaround got the payload airborne but shortened its operating time. The team’s post-flight notes also point to antenna arrangement and packet timing as areas to improve.</p>
            <a className="mission-text-link" href="https://github.com/knivier/SkyCell#readme" target="_blank" rel="noreferrer">Read the post-flight notes</a>
          </details>
        </div>
      </section>

      <section className="mission-replay">
        <div className="mission-container mission-replay-inner">
          <div>
            <h2>A flight you can explore.</h2>
            <p>Follow an archived APEX tracker recording through synchronized charts, a timeline and an interactive trajectory.</p>
            <Link className="mission-button mission-button-light" to="/dashboard"><Play size={16} aria-hidden="true" /> Open the flight replay</Link>
          </div>
          <div className="mission-archive-note">
            <h3>From the APEX / SondeHub archive</h3>
            <p>125 observations · June 21, 2025</p>
            <p>This is an archived recording from the event balloon’s tracker. It is separate from SkyCell’s 915 MHz mesh payload telemetry and is not a live feed.</p>
            <p>The partial recording preserves reception gaps. Its peak recorded altitude is 29,510 m.</p>
          </div>
        </div>
      </section>

      <footer className="mission-footer mission-container">
        <div><a className="mission-wordmark" href="#mission-top">SkyCell</a><p>A student experiment in high-altitude communication.</p></div>
        <nav aria-label="Project source"><a href="https://github.com/knivier/SkyCell" target="_blank" rel="noreferrer">Flight & ground source</a><a href="https://github.com/sharonbasovich/skycell" target="_blank" rel="noreferrer">Website source</a></nav>
      </footer>
    </div>
  );
}

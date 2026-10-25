import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, Radio, RadioTower, Satellite, Terminal } from "lucide-react";

const steps = [
  { name: "Sensors", icon: Satellite, title: "Start with a reading.", description: "GPS and environmental sensors give the flight computer information about the payload and its surroundings.", word: "GPS", note: "Position + environmental readings", detail: "Collect the inputs" },
  { name: "Python", icon: Terminal, title: "Turn readings into telemetry.", description: "Python parses NMEA GPS data, prepares telemetry, and monitors the radio connection so the software can attempt reconnection.", word: "NMEA", note: "Read → parse → prepare", detail: "Flight software" },
  { name: "Radio", icon: Radio, title: "Give the reading a way down.", description: "A 915 MHz LoRa / Meshtastic link carries the prepared information between the airborne node and receivers on the ground.", word: "915", unit: "MHz", note: "LoRa / Meshtastic", detail: "The airborne link" },
  { name: "Ground", icon: RadioTower, title: "Inspect what arrives.", description: "Ground software logs received packets. RTL-SDR sweeps help inspect the radio environment, from 30 MHz to 1.5 GHz at 2.4 MS/s.", word: "RTL–SDR", note: "Packet logging + spectrum sweeps", detail: "Ground investigation" },
];

export default function SignalSequence({ reducedMotion }: { reducedMotion: boolean }) {
  const section = useRef<HTMLElement>(null);
  const [scrollStep, setScrollStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start 0.75", "end 0.25"] });
  useMotionValueEvent(scrollYProgress, "change", value => { if (!reducedMotion) setScrollStep(Math.min(3, Math.max(0, Math.floor(value * 4)))); });
  const active = selected ?? (reducedMotion ? 0 : scrollStep);
  const current = steps[active];
  return <section ref={section} className="field-signal" id="the-build" aria-labelledby="field-signal-title">
    <div className="field-container">
      <div className="field-signal-opening">
        <h2 id="field-signal-title">A reading needs<br />a way home.</h2>
        <p>Follow the chain from sensing to receiving. Select a stage to explore it.</p>
      </div>
      <div className="field-signal-rail" aria-label="Stages of the telemetry system">
        <div className="field-signal-track" aria-hidden="true"><span style={{ width: `${active / 3 * 100}%`, transitionDuration: reducedMotion ? "0ms" : "360ms" }} /></div>
        {steps.map((step, index) => {
          const Icon = step.icon;
          return <button key={step.name} type="button" aria-pressed={active === index} onClick={() => setSelected(index)} className={`${active === index ? "is-active" : ""}${index < active ? " is-passed" : ""}`} aria-controls="field-signal-detail"><span className="field-signal-node"><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></span><span>{step.name}</span></button>;
        })}
      </div>
      <div className="field-signal-detail" id="field-signal-detail">
        <div className="field-signal-explanation" aria-live={selected !== null ? "polite" : "off"} aria-atomic="true"><p className="field-signal-step">{active + 1} / 4 — {current.detail}</p><h3>{current.title}</h3><p>{current.description}</p></div>
        <div className="field-signal-visual" aria-hidden="true">
          <div className="field-signal-type-stage"><AnimatePresence initial={false}><motion.div key={current.word} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -5, transition: { duration: reducedMotion ? 0 : .12 } }} transition={{ duration: reducedMotion ? 0 : .22 }} className={`field-signal-word field-signal-word-${active}`}><span>{current.word}</span>{current.unit && <small>{current.unit}</small>}<p>{current.note}</p></motion.div></AnimatePresence></div>
          <svg viewBox="0 0 520 100" fill="none"><path d="M0 70h80c35 0 35-40 70-40h220c35 0 35 40 70 40h80" stroke="currentColor" opacity=".18" /><motion.path key={active} d="M0 70h80c35 0 35-40 70-40h220c35 0 35 40 70 40h80" stroke="currentColor" strokeWidth="1.5" initial={reducedMotion ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reducedMotion ? 0 : .65, ease: [.2, .8, .2, 1] }} /><circle cx="80" cy="70" r="4" fill="currentColor" /><circle cx="440" cy="70" r="4" fill="currentColor" /></svg>
        </div>
      </div>
      <div className="field-signal-bottom"><p>System explanation. The animation does not represent recorded or live packets.</p>{selected !== null && !reducedMotion ? <button type="button" onClick={() => setSelected(null)}>Follow the page <ArrowRight size={15} strokeWidth={1.5} aria-hidden="true" /></button> : <span>{reducedMotion ? "Select a stage to explore" : "Changes as you scroll"}</span>}</div>
    </div>
  </section>;
}

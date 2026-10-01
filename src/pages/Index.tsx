import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Database,
  Github,
  Play,
  Radio,
  Route,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ImageGallery from "@/components/ImageGallery";
import InteractiveStats from "@/components/InteractiveStats";
import ProjectTimeline from "@/components/ProjectTimeline";
import MissionReveal from "@/components/MissionReveal";

const systems = [
  {
    icon: Cpu,
    number: "01",
    title: "Airborne payload",
    tech: "Python · GPS / NMEA",
    description:
      "Onboard software collects position information and prepares telemetry for the radio link.",
  },
  {
    icon: Radio,
    number: "02",
    title: "Long-range radio",
    tech: "LoRa · Meshtastic",
    description:
      "Off-the-shelf radio nodes explore the reach of a mesh network between the balloon and the ground.",
  },
  {
    icon: Database,
    number: "03",
    title: "Ground station",
    tech: "Packet decoding · Data logging",
    description:
      "Ground software receives and stores payload packets so the team can inspect them after flight.",
  },
];

const Index = () => (
  <div>
    <section className="relative overflow-hidden bg-[#081723] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(#9bdbef 1px, transparent 1px), linear-gradient(90deg, #9bdbef 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-[1.15fr_0.85fr] md:gap-12 md:px-8 md:py-16">
        <div className="max-w-xl">
          <p className="mb-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />{" "}
            High-altitude radio experiment
          </p>
          <h1 className="text-[clamp(2.7rem,5.5vw,4.7rem)] font-semibold leading-[1.04] tracking-[-0.045em]">
            A network above
            <br />
            <span className="text-cyan-200">the clouds.</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-relaxed text-slate-300 md:text-lg">
            Four students. One balloon mission. SkyCell tested LoRa / Meshtastic
            links from the stratosphere at Hack Club APEX 2025.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-cyan-300 font-semibold text-slate-950 hover:bg-cyan-200"
            >
              <Link to="/dashboard">
                <Play size={16} /> Explore flight replay
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/development">
                See the build <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-slate-400">
            <span>APEX / June 2025</span>
            <span className="text-cyan-200">1st place</span>
            <span>Hardware + software</span>
          </div>
        </div>
        <figure className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-xl border border-white/20 bg-slate-800">
          <img
            src="/gallery/PXL_20250621_172905846.MP.jpg"
            alt="The APEX high-altitude balloon train and its payloads after launch."
            width="659"
            height="880"
            className="h-[360px] w-full object-cover md:h-[470px]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/10"
          />
          <div
            aria-hidden="true"
            className="absolute left-[37%] top-[17%] h-20 w-20 rounded-full border border-white/35 before:absolute before:left-1/2 before:top-[-8px] before:h-4 before:w-px before:bg-white/70 after:absolute after:bottom-[-8px] after:left-1/2 after:h-4 after:w-px after:bg-white/70"
          />
          <span className="absolute left-5 top-5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/90">
            Field archive / 01
          </span>
          <figcaption className="absolute inset-x-0 bottom-0 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-200">
                  June 21, 2025
                </p>
                <p className="mt-1 text-sm font-medium">
                  Launch day, Massachusetts
                </p>
              </div>
              <ArrowUpRight
                size={24}
                className="text-cyan-200"
                aria-hidden="true"
              />
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
    <InteractiveStats />
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
      <MissionReveal className="mb-10 max-w-2xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
          01 / The system
        </p>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Packets, from sky to ground.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          The experiment explored whether a balloon could extend a mesh network
          using affordable, off-the-shelf hardware. The team built the payload,
          onboard software, and ground tools together.
        </p>
      </MissionReveal>
      <ol className="grid gap-4 md:grid-cols-3">
        {systems.map(({ icon: Icon, ...system }, index) => (
          <li key={system.title}>
            <MissionReveal
              delay={index * 0.06}
              className="h-full rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <Icon size={24} className="text-primary" />
                <span className="font-mono text-xs text-muted-foreground">
                  {system.number}
                </span>
              </div>
              <h3 className="text-xl font-semibold tracking-tight">
                {system.title}
              </h3>
              <p className="mb-4 mt-2 font-mono text-[11px] text-primary">
                {system.tech}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {system.description}
              </p>
            </MissionReveal>
          </li>
        ))}
      </ol>
      <MissionReveal className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The public browser demo replays archived APEX tracker positions. It is
          separate from the payload's radio telemetry and the flight software.
        </p>
        <a
          href="https://github.com/knivier/SkyCell"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Flight & ground source <ArrowUpRight size={15} />
        </a>
      </MissionReveal>
    </section>
    <ImageGallery />
    <ProjectTimeline />
    <section className="border-t border-border bg-[#081723] text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:py-20">
        <MissionReveal>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-cyan-300">
            04 / Mission replay
          </p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Follow the flight.
          </h2>
          <p className="mb-7 mt-5 max-w-xl text-base leading-relaxed text-slate-300">
            Explore an archived APEX tracker recording in the browser. Scrub
            through time, inspect the telemetry charts, and rotate the 3D
            trajectory.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-cyan-300 font-semibold text-slate-950 hover:bg-cyan-200"
            >
              <Link to="/dashboard">
                <Route size={17} /> Open flight replay
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <a
                href="https://github.com/sharonbasovich/skycell"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={16} /> Read the code
              </a>
            </Button>
          </div>
        </MissionReveal>
        <MissionReveal
          delay={0.1}
          className="rounded-xl border border-white/15 bg-white/[0.035] p-6 md:p-8"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-cyan-200">
            Inside the browser demo
          </p>
          <ul className="mt-6 space-y-5">
            {[
              "Timestamp-based playback and seeking",
              "Position and altitude over the flight",
              "Interactive 3D flight trajectory",
            ].map((label, index) => (
              <li
                key={label}
                className="flex items-center gap-3 text-sm text-slate-200"
              >
                <span className="font-mono text-xs text-cyan-300">
                  0{index + 1}
                </span>
                {label}
              </li>
            ))}
          </ul>
          <p className="mt-7 border-t border-white/15 pt-5 font-mono text-xs text-slate-400">
            React · TypeScript · Three.js
          </p>
        </MissionReveal>
      </div>
    </section>
  </div>
);

export default Index;

import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Cable, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import MissionReveal from "@/components/MissionReveal";

const entries = [
  {
    date: "June 21, 2025",
    title: "Launch day",
    content:
      "The APEX balloon mission launched with SkyCell's payload. The team documented the final electronics assembly, insulated enclosure, and balloon train in the project photo archive.",
  },
  {
    date: "June 18, 2025",
    title: "Final tests",
    content:
      "The Meshtastic network was working and payload packaging was complete, ahead of the APEX launch weekend.",
  },
  {
    date: "May 19, 2025",
    title: "Travel to APEX",
    content:
      "The team booked flights to Boston for the event the following month.",
  },
  {
    date: "May 17, 2025",
    title: "Project showcase",
    content:
      "Work began on the project website after registering the SkyCell domain.",
  },
  {
    date: "May 11, 2025",
    title: "Telemetry dashboard",
    content:
      "The team began building a dashboard to graph and log telemetry from the payload.",
  },
  {
    date: "May 5, 2025",
    title: "First funding",
    content: "The team received its first $100 grant for the project.",
  },
  {
    date: "April 5, 2025",
    title: "Proposal approved",
    content:
      "The proposal was approved and the team began dividing up the project tasks.",
  },
  {
    date: "March 30, 2025",
    title: "Proposal submitted",
    content:
      "The project proposal included a full report, bill of materials, and CAD design.",
  },
  {
    date: "March 17, 2025",
    title: "Team formed",
    content:
      "Four students from across the US and Canada came together to build a project for Hack Club APEX.",
  },
];

const Development = () => (
  <div>
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 md:grid-cols-[1.15fr_0.85fr] md:px-8 md:py-16">
        <div>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Engineering / APEX 2025
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.035em] md:text-5xl">
            The build behind
            <br />
            the balloon.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            A student experiment spanning Python, GPS parsing, Meshtastic
            radios, payload assembly, and ground software. These notes preserve
            the team's path from its first proposal to flight.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/dashboard">
              Explore the flight recording <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
        <figure>
          <img
            src="/gallery/1000004195.jpg"
            alt="SkyCell payload electronics and radio hardware being assembled on a workbench."
            width="600"
            height="480"
            className="h-[280px] w-full rounded-xl border border-border object-cover md:h-[340px]"
          />
          <figcaption className="mt-3 font-mono text-[11px] text-muted-foreground">
            Payload assembly / June 2025
          </figcaption>
        </figure>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
      <MissionReveal className="mb-8 max-w-2xl">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
          System boundaries
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          One mission. Two codebases.
        </h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          The deployed website is the mission archive and browser replay. The
          onboard and ground-station programs live in the team's companion
          repository.
        </p>
      </MissionReveal>
      <div className="grid gap-5 md:grid-cols-2">
        <MissionReveal className="rounded-xl border border-border bg-card p-6">
          <Radio size={24} className="mb-5 text-primary" />
          <h3 className="text-xl font-semibold">Mission software & hardware</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Python tools for GPS / NMEA parsing, telemetry packets, Meshtastic
            connections, and ground logging, alongside the team's hardware
            documentation.
          </p>
          <a
            href="https://github.com/knivier/SkyCell"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Flight & ground-station repository <ArrowUpRight size={15} />
          </a>
        </MissionReveal>
        <MissionReveal
          delay={0.06}
          className="rounded-xl border border-border bg-card p-6"
        >
          <Cable size={24} className="mb-5 text-primary" />
          <h3 className="text-xl font-semibold">Website & flight replay</h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A React / TypeScript application that loads archived APEX tracker
            data and presents synchronized telemetry charts, playback controls,
            and a Three.js trajectory.
          </p>
          <a
            href="https://github.com/sharonbasovich/skycell"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            Website & demo repository <ArrowUpRight size={15} />
          </a>
        </MissionReveal>
      </div>
    </section>
    <section className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <MissionReveal className="mb-9 max-w-2xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
            Flight lessons
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            What the flight taught us.
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            A proof of concept comes with constraints. The team's post-flight
            notes explain where the hardware worked and where the next iteration
            needs attention.
          </p>
        </MissionReveal>
        <div className="grid gap-8 md:grid-cols-2">
          <MissionReveal>
            <p className="font-mono text-xs text-primary">
              01 / Power delivery
            </p>
            <h3 className="mb-3 mt-3 text-xl font-semibold">
              Budget for startup current.
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The initial buck-converter setup caused brownouts during startup.
              A power-bank workaround got the payload into the air, but reduced
              its operating time. Reliable power delivery is part of the
              communications problem.
            </p>
          </MissionReveal>
          <MissionReveal delay={0.06}>
            <p className="font-mono text-xs text-primary">
              02 / Radio reliability
            </p>
            <h3 className="mb-3 mt-3 text-xl font-semibold">
              A connection is only the beginning.
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The team observed a long-range node connection, but received only
              a few payload packets. Antenna arrangement, sending frequency, and
              power continuity mattered more than a range number alone.
            </p>
          </MissionReveal>
        </div>
        <a
          href="https://github.com/knivier/SkyCell#readme"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Read the team's flight notes <ArrowUpRight size={15} />
        </a>
      </div>
    </section>
    <section className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
      <MissionReveal className="mb-8">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
          March — June 2025
        </p>
        <h2 className="text-3xl font-semibold tracking-tight">
          Team build log.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Milestones from the original project notes and launch photo archive.
        </p>
      </MissionReveal>
      <div className="divide-y divide-border border-y border-border">
        {entries.map((entry, index) => (
          <details key={entry.date} open={index === 0} className="group">
            <summary className="flex min-h-16 cursor-pointer list-none flex-wrap items-center gap-2 py-5 sm:flex-nowrap sm:gap-8">
              <span className="w-40 shrink-0 font-mono text-xs text-muted-foreground">
                {entry.date}
              </span>
              <span className="flex-1 text-sm font-semibold">
                {entry.title}
              </span>
              <span
                aria-hidden="true"
                className="ml-auto font-mono text-primary group-open:hidden"
              >
                +
              </span>
              <span
                aria-hidden="true"
                className="ml-auto hidden font-mono text-primary group-open:block"
              >
                −
              </span>
            </summary>
            <p className="pb-6 text-sm leading-relaxed text-muted-foreground sm:pl-48">
              {entry.content}
            </p>
          </details>
        ))}
      </div>
    </section>
  </div>
);

export default Development;

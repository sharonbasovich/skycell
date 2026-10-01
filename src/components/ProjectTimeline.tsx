import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import MissionReveal from "./MissionReveal";

const milestones = [
  {
    date: "March 2025",
    title: "A team and a proposal",
    detail:
      "Four students came together, then submitted a report, bill of materials, and CAD design.",
  },
  {
    date: "April 2025",
    title: "From proposal to build",
    detail:
      "The proposal was approved and the team began dividing up the hardware and software work.",
  },
  {
    date: "May 2025",
    title: "Software takes shape",
    detail:
      "Telemetry dashboard development, initial funding, and the project showcase website.",
  },
  {
    date: "June 2025",
    title: "Ready for APEX",
    detail:
      "Radio-network tests, final payload packaging, and launch day in Massachusetts.",
  },
];

const ProjectTimeline = () => (
  <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
    <MissionReveal className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
          03 / The build
        </p>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          From workbench to launch.
        </h2>
      </div>
      <Link
        to="/development"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline"
      >
        Read the team log <ArrowRight size={16} />
      </Link>
    </MissionReveal>
    <ol className="grid gap-8 md:grid-cols-4">
      {milestones.map((item, index) => (
        <li key={item.date}>
          <MissionReveal delay={index * 0.06}>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 font-mono text-[11px] text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {item.date}
            </p>
            <h3 className="mb-3 mt-2 text-lg font-semibold tracking-tight">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.detail}
            </p>
          </MissionReveal>
        </li>
      ))}
    </ol>
  </section>
);

export default ProjectTimeline;

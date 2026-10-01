import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container mx-auto flex min-h-[75vh] max-w-4xl flex-col justify-center px-6 py-12">
      <p className="mb-4 font-mono text-sm text-primary">404 / OFF COURSE</p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
        This page isn't on the flight path.
      </h1>
      <p className="mt-5 text-lg text-muted-foreground">
        Explore the mission or open the archived telemetry replay.
      </p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground"
        >
          Back to the mission <ArrowRight size={18} />
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 font-medium"
        >
          Open flight replay
        </Link>
      </div>
    </section>
  );
}

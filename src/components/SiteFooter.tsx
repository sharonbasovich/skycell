import { Link } from "react-router-dom";
import { ArrowUpRight, Radio } from "lucide-react";

const SiteFooter = () => (
  <footer className="border-t border-border bg-background">
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto] md:px-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-lg font-bold"
        >
          <Radio size={19} className="text-primary" /> SkyCell.
        </Link>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          A four-student high-altitude communications experiment, built for Hack
          Club APEX 2025.
        </p>
      </div>
      <nav
        aria-label="Project resources"
        className="grid gap-1 text-sm sm:grid-cols-2 sm:gap-x-8 md:grid-cols-1"
      >
        <Link
          to="/dashboard"
          className="inline-flex min-h-11 items-center gap-2 font-medium hover:text-primary"
        >
          Explore flight replay <ArrowUpRight size={15} />
        </Link>
        <a
          href="https://github.com/sharonbasovich/skycell"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 font-medium hover:text-primary"
        >
          Website & demo source <ArrowUpRight size={15} />
        </a>
        <a
          href="https://github.com/knivier/SkyCell"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 font-medium hover:text-primary"
        >
          Flight & ground-station source <ArrowUpRight size={15} />
        </a>
      </nav>
    </div>
    <div className="mx-auto max-w-6xl border-t border-border px-5 py-5 text-xs text-muted-foreground md:px-8">
      SkyCell team · APEX 2025 · Mission archive and browser demo
    </div>
  </footer>
);

export default SiteFooter;

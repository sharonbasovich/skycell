import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Github, Menu, Radio, X } from "lucide-react";

const navigation = [
  { name: "Mission", path: "/" },
  { name: "Build log", path: "/development" },
  { name: "Flight replay", path: "/dashboard" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-md"
          aria-label="SkyCell mission home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
            <Radio size={19} />
          </span>
          <span className="text-xl font-bold tracking-tight">
            SkyCell<span className="text-primary">.</span>
          </span>
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `rounded-sm py-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/sharonbasovich/skycell"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-11 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent sm:inline-flex"
          >
            <Github size={16} /> Demo source <ArrowUpRight size={14} />
          </a>
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-accent md:hidden"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-border bg-background px-5 py-3 md:hidden"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-3 text-sm font-medium ${isActive ? "bg-accent text-primary" : "text-foreground"}`
              }
            >
              {item.name}
            </NavLink>
          ))}
          <a
            href="https://github.com/sharonbasovich/skycell"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md px-3 py-3 text-sm font-medium"
          >
            <Github size={16} /> Demo source <ArrowUpRight size={14} />
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;

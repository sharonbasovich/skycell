import { useRef, useState } from "react";
import { Expand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import MissionReveal from "./MissionReveal";

type Photo = { src: string; title: string; description: string };
const photos: Record<"launch" | "build", Photo[]> = {
  launch: [
    {
      src: "/gallery/PXL_20250621_172905846.MP.jpg",
      title: "Launch day",
      description:
        "The APEX balloon train and payloads rising into a blue sky.",
    },
    {
      src: "/gallery/1000004204.jpg",
      title: "Flight-ready payload",
      description:
        "Insulated payload enclosure with the radio antenna mounted for flight.",
    },
    {
      src: "/gallery/1000004195.jpg",
      title: "Final electronics assembly",
      description:
        "Payload electronics, power connections, and radio hardware on the workbench.",
    },
  ],
  build: [
    {
      src: "/gallery/PXL_20250611_170737813.MP.jpg",
      title: "Sensor prototyping",
      description: "A Raspberry Pi Pico wired to a sensor on a breadboard.",
    },
    {
      src: "/gallery/PXL_20250614_005833983.MP.jpg",
      title: "Iterating on the circuit",
      description: "Breadboard wiring during electronics development.",
    },
    {
      src: "/gallery/PXL_20250619_171928093.MP.jpg",
      title: "Radio preparation",
      description:
        "A powered Heltec radio connected to its battery before launch.",
    },
  ],
};

const ImageGallery = () => {
  const [view, setView] = useState<"launch" | "build">("launch");
  const [selected, setSelected] = useState<Photo | null>(null);
  const photoTrigger = useRef<HTMLButtonElement | null>(null);
  return (
    <section id="gallery" className="border-y border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <MissionReveal className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">
              02 / In the field
            </p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Built, tested, flown.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              A look at the real hardware and the days that took it from a
              breadboard to the sky.
            </p>
          </div>
          <div
            className="inline-flex rounded-lg border border-border bg-background p-1"
            role="group"
            aria-label="Photo collection"
          >
            {(["launch", "build"] as const).map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setView(value)}
                aria-pressed={view === value}
                className={`min-h-11 rounded-md px-4 text-sm font-medium transition-colors ${view === value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
              >
                {value === "launch" ? "Launch day" : "Prototyping"}
              </button>
            ))}
          </div>
        </MissionReveal>
        <div className="grid gap-6 md:grid-cols-3">
          {photos[view].map((photo) => (
            <figure key={photo.src}>
              <button
                type="button"
                onClick={(event) => {
                  photoTrigger.current = event.currentTarget;
                  setSelected(photo);
                }}
                aria-label={`Enlarge photo: ${photo.title}`}
                className="group relative block w-full overflow-hidden rounded-lg border border-border bg-background"
              >
                <img
                  src={photo.src}
                  alt={photo.description}
                  width="800"
                  height="600"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-md bg-slate-950/75 text-white">
                  <Expand size={16} />
                </span>
              </button>
              <figcaption className="mt-4">
                <span className="text-sm font-semibold">{photo.title}</span>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {photo.description}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          className="max-w-5xl p-5"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            photoTrigger.current?.focus();
          }}
        >
          <DialogTitle>{selected?.title}</DialogTitle>
          <DialogDescription>{selected?.description}</DialogDescription>
          {selected && (
            <img
              src={selected.src}
              alt={selected.description}
              className="max-h-[72vh] w-full rounded-md object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ImageGallery;

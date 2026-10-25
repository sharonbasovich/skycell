import { useRef, useState, type KeyboardEvent, type SyntheticEvent } from "react";
import { useInView } from "framer-motion";
import { Expand } from "lucide-react";

export interface EvidencePhoto {
  id: string;
  title: string;
  src: string;
  fullSrc?: string;
  alt: string;
  caption: string;
  description: string;
  details: string[];
  width: number;
  height: number;
}

const photographs: EvidencePhoto[] = [
  {
    id: "enclosure", title: "Enclosure", src: "/gallery/hardware-enclosure-1600.webp", fullSrc: "/gallery/1000004204.jpg",
    alt: "The insulated SkyCell enclosure, wrapped with clear tape, with a long black side antenna and a blue suspension fitting on top.",
    caption: "The flight-ready enclosure and radio antenna.",
    description: "A foam enclosure carried the experiment. Clear tape held the packaging together; the long antenna and the blue suspension fitting connected it to the world outside.",
    details: ["Foam insulation and taped seams", "Side-mounted radio antenna", "Top suspension attachment"],
    width: 1600, height: 1200,
  },
  {
    id: "electronics", title: "Electronics", src: "/gallery/hardware-electronics-1600.webp", fullSrc: "/gallery/1000004195.jpg",
    alt: "The SkyCell flight computer, converter board, radio hardware, and power wiring assembled on the workbench before packaging.",
    caption: "Electronics, radios, and power connections before final packaging.",
    description: "Before the lid went on, flight software, sensing, radio hardware, and power had to work together. The workbench photograph shows the physical connections behind the experiment.",
    details: ["Flight computer and connected boards", "Power converter and wiring", "Radio and peripheral connections"],
    width: 1200, height: 1600,
  },
  {
    id: "launch", title: "Launch", src: "/gallery/hardware-launch.webp", fullSrc: "/gallery/PXL_20250621_172905846.MP.jpg",
    alt: "The actual APEX two-balloon train and its suspended payloads rising into a clear blue Massachusetts sky.",
    caption: "The actual APEX balloon train. Massachusetts, June 21, 2025.",
    description: "The actual event balloon train carried multiple packages beneath two helium balloons. This photograph is the launch record; the single-balloon scene above is an illustrative view of the idea.",
    details: ["APEX launch in Massachusetts", "June 21, 2025", "Original project photograph"],
    width: 659, height: 880,
  },
];

interface Props {
  reducedMotion: boolean;
  onOpenPhoto: (photo: EvidencePhoto, trigger: HTMLButtonElement) => void;
}

export default function HardwareExplorer({ reducedMotion, onOpenPhoto }: Props) {
  const [active, setActive] = useState(0);
  const [displayed, setDisplayed] = useState(0);
  const [attempts, setAttempts] = useState([0, 0, 0]);
  const [readyImages, setReadyImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [requestedLoad, setRequestedLoad] = useState(false);
  const requested = useRef(0);
  const preloadZone = useRef<HTMLElement>(null);
  const imageNearView = useInView(preloadZone, { once: true, margin: "320px 0px", amount: .01 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const photo = photographs[active];
  const imageKey = `${photo.id}-${attempts[active]}`;
  const failed = Boolean(failedImages[imageKey]);
  const pending = !readyImages[imageKey] && !failed;
  const shouldLoad = imageNearView || requestedLoad;
  const choose = (index: number) => {
    requested.current = index;
    setRequestedLoad(true);
    setActive(index);
    if (readyImages[`${photographs[index].id}-${attempts[index]}`]) setDisplayed(index);
  };
  const decoded = async (event: SyntheticEvent<HTMLImageElement>, index: number, key: string) => {
    const image = event.currentTarget;
    try {
      await image.decode();
      // A retry remounts the image; stale decodes and fast tab reversals must
      // never replace the latest selection with an earlier request.
      if (!image.isConnected) return;
      setReadyImages(previous => ({ ...previous, [key]: true }));
      if (requested.current === index) setDisplayed(index);
    } catch {
      if (image.isConnected) setFailedImages(previous => ({ ...previous, [key]: true }));
    }
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % photographs.length;
    else if (event.key === "ArrowLeft") next = (index + photographs.length - 1) % photographs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = photographs.length - 1;
    else return;
    event.preventDefault(); choose(next); tabRefs.current[next]?.focus();
  };
  return <section ref={preloadZone} className="field-hardware" id="in-the-field" aria-labelledby="field-title">
    <div className="field-container">
      <div className="field-hardware-opening">
        <h2 id="field-title">The hardware, up close.</h2>
        <p>Explore the real enclosure, electronics, and launch.</p>
      </div>
      <div className="field-hardware-tabs" role="tablist" aria-label="Explore the project photographs">
        {photographs.map((item, index) => <button key={item.id} ref={node => { tabRefs.current[index] = node; }} type="button" role="tab" id={`field-tab-${item.id}`} aria-controls="field-hardware-panel" aria-selected={active === index} tabIndex={active === index ? 0 : -1} onClick={() => choose(index)} onKeyDown={event => onTabKey(event, index)}>{item.title}<span aria-hidden="true" /></button>)}
      </div>
      <div className="field-hardware-panel" id="field-hardware-panel" role="tabpanel" aria-labelledby={`field-tab-${photo.id}`} aria-busy={shouldLoad && pending}>
        <div className={`field-hardware-image field-hardware-image-${photographs[displayed].id}`} data-reduced-motion={reducedMotion}>
          {photographs.map((item, index) => {
            const key = `${item.id}-${attempts[index]}`;
            const visible = displayed === index && Boolean(readyImages[key]);
            const interactive = visible && active === index;
            return <figure key={item.id} data-visible={visible} aria-hidden={!interactive}>
              <button type="button" className={`field-photo-frame${interactive ? " field-photo-button" : ""}`} disabled={!interactive} tabIndex={interactive ? 0 : -1} onClick={event => onOpenPhoto(item, event.currentTarget)} aria-label={`View photo: ${item.caption}`}>
                <img key={key} src={shouldLoad ? `${item.src}${attempts[index] ? `?retry=${attempts[index]}` : ""}` : undefined} alt={item.alt} width={item.width} height={item.height} loading="eager" decoding="async" onLoad={event => { void decoded(event, index, key); }} onError={() => setFailedImages(previous => ({ ...previous, [key]: true }))} />
                {interactive && <span className="field-photo-expand"><Expand size={18} strokeWidth={1.5} aria-hidden="true" /><span>View photograph</span></span>}
              </button>
            </figure>;
          })}
          {failed ? <div className="field-image-error" role="status"><p>This photograph could not be loaded.</p><button type="button" onClick={() => setAttempts(previous => previous.map((attempt, index) => index === active ? attempt + 1 : attempt))}>Try again</button></div> : shouldLoad && pending ? <p className="field-image-loading" role="status">Loading {photo.title.toLowerCase()} photograph…</p> : null}
        </div>
        <div className="field-hardware-description" aria-live="polite" aria-atomic="true">
          <p className="field-photo-caption">{photo.caption}</p>
          <h3>{photo.title === "Enclosure" ? "Built for the flight." : photo.title === "Electronics" ? "Connected on the workbench." : "From the ground, for real."}</h3>
          <p>{photo.description}</p>
          <ul>{photo.details.map(detail => <li key={detail}>{detail}</li>)}</ul>
        </div>
      </div>
    </div>
  </section>;
}

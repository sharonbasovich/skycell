import type { PointerEvent } from "react";
import { Maximize2 } from "lucide-react";

export interface StoryPhoto {
  src: string;
  preview: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

function tiltCard(event: PointerEvent<HTMLButtonElement>) {
  if (event.pointerType !== "mouse") return;
  const card = event.currentTarget;
  const { left, top, width, height } = card.getBoundingClientRect();
  const x = (event.clientX - left) / width - .5;
  const y = (event.clientY - top) / height - .5;
  card.style.setProperty("--photo-tilt-x", `${-y * 16}deg`);
  card.style.setProperty("--photo-tilt-y", `${x * 20}deg`);
}

function resetTilt(event: PointerEvent<HTMLButtonElement>) {
  event.currentTarget.style.removeProperty("--photo-tilt-x");
  event.currentTarget.style.removeProperty("--photo-tilt-y");
}

export default function StoryPhotoCard({ photo, tabIndex, onOpen }: {
  photo: StoryPhoto;
  tabIndex: number;
  onOpen: (button: HTMLButtonElement) => void;
}) {
  return (
    <button
      type="button"
      className="story-photo-card"
      tabIndex={tabIndex}
      aria-label={`Enlarge photo: ${photo.alt}`}
      aria-haspopup="dialog"
      onClick={event => onOpen(event.currentTarget)}
      onPointerMove={tiltCard}
      onPointerLeave={resetTilt}
      onPointerCancel={resetTilt}
    >
      <span className="story-photo-mount">
        <img src={photo.preview} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" />
        <span className="story-photo-expand" aria-hidden="true"><Maximize2 size={13} strokeWidth={1.6} /></span>
      </span>
    </button>
  );
}

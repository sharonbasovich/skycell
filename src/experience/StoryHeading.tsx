import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";

export type HeadingTreatment = 0 | 1 | 2 | 3;
interface Props {
  index: number;
  lines: string[];
  progress: MotionValue<number>;
  range: number[];
  treatment: HeadingTreatment;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  staticMode: boolean;
}

function HeadingLine({ text, order, progress, range, treatment, pointerX, pointerY }: Omit<Props, "lines" | "index" | "staticMode"> & { text: string; order: number }) {
  const start = range[0] + order * .003;
  const end = range[1] + order * .003;
  const exit = range[range.length - 1];
  const isOpening = range[0] === 0;
  const reveal = useTransform(progress, [isOpening ? -.025 : start, isOpening ? -.005 : end, exit], [0, 1, 1]);
  const lift = useTransform(reveal, [0, 1], [108, 0]);
  const liftY = useTransform(lift, value => `${value}%`);
  const angle = useTransform(reveal, [0, 1], [12, 0]);
  const depthX = useTransform(pointerX, [-1, 1], [-(order + 1) * 4, (order + 1) * 4]);
  const depthY = useTransform(pointerY, [-1, 1], [-(order + 1) * 2, (order + 1) * 2]);
  const x = useSpring(depthX, { stiffness: 160, damping: 28 });
  const y = useSpring(depthY, { stiffness: 160, damping: 28 });
  const depthLift = useTransform(() => y.get() + (1 - reveal.get()) * (24 + order * 12));
  const depthTilt = useTransform(reveal, [0, 1], [-18, 0]);
  const rotateY = useTransform(pointerX, [-1, 1], [-4, 4]);
  const sweep = useTransform(progress, [isOpening ? -.025 : start, isOpening ? -.005 : end + .025], [100, 0]);
  const clipPath = useTransform(sweep, value => `inset(0 ${value}% 0 0)`);
  if (treatment === 1) return <span className="story-heading-mask"><motion.span className="story-heading-line" style={{ y: liftY, rotateX: angle }}>{text}</motion.span></span>;
  if (treatment === 2) return <motion.span className="story-heading-line story-heading-depth" style={{ x, y: depthLift, rotateX: depthTilt, rotateY }}>{text}</motion.span>;
  return <span className="story-heading-line story-heading-signal"><span>{text}</span><motion.span className="story-heading-signal-light" style={{ clipPath }} aria-hidden="true">{text}</motion.span></span>;
}

/** Three isolated, query-selected treatments keep the accepted typography intact. */
export default function StoryHeading(props: Props) {
  const { index, lines, treatment, staticMode } = props;
  const Tag = index === 0 ? "h1" : "h2";
  return <Tag id={`story-heading-${index}`} className={`story-heading story-heading-treatment-${staticMode ? 0 : treatment}`} aria-label={lines.join(" ")}>
    {staticMode || treatment === 0 ? lines.map((line, order) => <span className="story-heading-line" key={order}>{line}</span>) : lines.map((text, order) => <HeadingLine {...props} text={text} order={order} key={order} />)}
  </Tag>;
}

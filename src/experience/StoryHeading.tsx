import { motion, useTransform, type MotionValue } from "framer-motion";

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

type LineProps = Pick<Props, "progress" | "range"> & { text: string; order: number };

function DepthLine({ text, order, progress, range, pointerX, pointerY }: LineProps & Pick<Props, "pointerX" | "pointerY">) {
  const [enter, rest, leave, end] = range;
  const staggeredEnter = enter + (rest - enter) * order * .16;
  const phase = useTransform(
    progress,
    enter === 0 ? [rest, leave] : end === undefined ? [staggeredEnter, rest] : [staggeredEnter, rest, leave, end],
    enter === 0 ? [0, -1] : end === undefined ? [1, 0] : [1, 0, 0, -1],
  );
  const x = useTransform(pointerX, [-1, 1], [-(10 + order * 7), 10 + order * 7]);
  const y = useTransform(() => pointerY.get() * (4 + order * 2) + phase.get() * (22 + order * 7));
  const z = useTransform(phase, [-1, 0, 1], [-(64 + order * 24), 0, -(110 + order * 42)]);
  const rotateX = useTransform(() => -6 * pointerY.get() - 28 * phase.get());
  const rotateY = useTransform(pointerX, [-1, 1], [-9, 9]);

  return <motion.span className="story-heading-line story-heading-depth" style={{ x, y, z, rotateX, rotateY }}>{text}</motion.span>;
}

function ComparisonLine({ text, order, progress, range, treatment }: LineProps & Pick<Props, "treatment">) {
  const start = range[0] + order * .003;
  const end = range[1] + order * .003;
  const exit = range[range.length - 1];
  const isOpening = range[0] === 0;
  const reveal = useTransform(progress, [isOpening ? -.025 : start, isOpening ? -.005 : end, exit], [0, 1, 1]);
  const lift = useTransform(reveal, [0, 1], [108, 0]);
  const liftY = useTransform(lift, value => `${value}%`);
  const angle = useTransform(reveal, [0, 1], [12, 0]);
  const sweep = useTransform(progress, [isOpening ? -.025 : start, isOpening ? -.005 : end + .025], [100, 0]);
  const clipPath = useTransform(sweep, value => `inset(0 ${value}% 0 0)`);
  if (treatment === 1) return <span className="story-heading-mask"><motion.span className="story-heading-line" style={{ y: liftY, rotateX: angle }}>{text}</motion.span></span>;
  return <span className="story-heading-line story-heading-signal"><span>{text}</span><motion.span className="story-heading-signal-light" style={{ clipPath }} aria-hidden="true">{text}</motion.span></span>;
}

export default function StoryHeading(props: Props) {
  const { index, lines, treatment, staticMode, progress, range, pointerX, pointerY } = props;
  const Tag = index === 0 ? "h1" : "h2";
  const Line = treatment === 2 ? DepthLine : ComparisonLine;
  return <Tag id={`story-heading-${index}`} className={`story-heading story-heading-treatment-${staticMode ? 0 : treatment}`} aria-label={lines.join(" ")}>
    {lines.map((text, order) => staticMode || treatment === 0
      ? <span className="story-heading-line" key={order}>{text}</span>
      : <Line key={order} text={text} order={order} progress={progress} range={range} treatment={treatment} pointerX={pointerX} pointerY={pointerY} />)}
  </Tag>;
}

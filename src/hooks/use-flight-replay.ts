import { useCallback, useEffect, useMemo, useState } from "react";
import {
  flightDuration,
  sampleTrajectory,
  type TrajectoryPoint,
} from "@/utils/csvDataUtils";
import { ReplayClock } from "@/utils/replayClock";

export function useFlightReplay(points: TrajectoryPoint[]) {
  const duration = useMemo(() => flightDuration(points), [points]);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const clock = useMemo(() => new ReplayClock(duration), [duration]);

  const seek = useCallback(
    (value: number) => {
      const next = clock.seek(value);
      setElapsed(next);
      if (next >= duration) setIsPlaying(false);
    },
    [duration, clock],
  );

  useEffect(() => {
    if (!isPlaying || duration === 0) return;
    let previousTime = performance.now();
    let lastRender = previousTime;
    let frame: number;
    const tick = (time: number) => {
      const next = clock.advance(time - previousTime, speed);
      previousTime = time;
      if (time - lastRender >= 1000 / 30 || next >= duration) {
        setElapsed(next);
        lastRender = time;
      }
      if (next >= duration) setIsPlaying(false);
      else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, speed, duration, clock]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    seek(0);
  }, [seek]);
  const toggle = useCallback(() => {
    if (clock.elapsed >= duration) seek(0);
    setIsPlaying((playing) => !playing);
  }, [duration, seek, clock]);
  const sample = useMemo(
    () => sampleTrajectory(points, elapsed),
    [points, elapsed],
  );
  return {
    elapsed,
    duration,
    isPlaying,
    speed,
    setSpeed,
    seek,
    reset,
    toggle,
    ...sample,
  };
}

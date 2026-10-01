/** A wall-time delta advances the current cursor, so seeking cannot be overwritten by a stale playback anchor. */
export class ReplayClock {
  elapsed = 0;
  constructor(readonly duration: number) {}
  seek(value: number) {
    this.elapsed = Math.min(
      this.duration,
      Math.max(0, Number.isFinite(value) ? value : 0),
    );
    return this.elapsed;
  }
  advance(wallTimeDelta: number, speed: number) {
    return this.seek(
      this.elapsed + Math.max(0, wallTimeDelta) * Math.max(0, speed),
    );
  }
}

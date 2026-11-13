export function advanceParticle(p, time, step, pointer, pulse) {
  const dx = p.x - pointer.x, dy = p.y - pointer.y;
  const distance = Math.hypot(dx, dy);
  const falloff = Math.max(0, 1 - distance / 55);
  if (falloff && pointer.until > time) {
    const kick = falloff * (2 + pointer.speed * 0.2) * p.mass;
    p.vx += step * kick * dx / (distance || 1);
    p.vy += step * kick * dy / (distance || 1);
    p.release = time + 850;
  }
  if (pulse) {
    const age = (time - pulse.start) / 1000;
    const px = p.homeX - pulse.x, py = p.homeY - pulse.y;
    const radius = Math.hypot(px, py);
    const ring = Math.max(0, 1 - Math.abs(radius - age * 210) / 28);
    if (age >= 0 && age < 0.8 && ring) {
      p.vx += step * ring * px / (radius || 1);
      p.vy += step * ring * py / (radius || 1);
    }
  }
  const spring = time >= p.release ? 0.073 : 0.016;
  const drag = Math.pow(0.84, step);
  p.vx = (p.vx + (p.homeX - p.x) * spring * step) * drag;
  p.vy = (p.vy + (p.homeY - p.y) * spring * step) * drag;
  p.x += p.vx * step;
  p.y += p.vy * step;
}

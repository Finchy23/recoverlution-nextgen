import { useEffect, useRef } from "react";

/*
  Friction → Flow
  Chaotic particles resolve into an ordered constellation through presence and touch.
  Demonstrates: state resolution, viscous springs, entropy decay
*/

interface Particle {
  x: number; y: number; ox: number; oy: number;
  vx: number; vy: number; radius: number; hue: number;
}

export function FrictionFlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false, pressing: false });
  const entropyRef = useRef(1);
  const dimsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dimsRef.current = { w: rect.width, h: rect.height };
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(rect.width, rect.height);
    }

    function initParticles(w: number, h: number) {
      const count = Math.min(100, Math.floor((w * h) / 5000));
      const cx = w / 2, cy = h / 2;
      particlesRef.current = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 5 + Math.random() * 0.4;
        const dist = 25 + (i / count) * Math.min(w, h) * 0.28;
        return {
          x: cx + (Math.random() - 0.5) * w * 0.85,
          y: cy + (Math.random() - 0.5) * h * 0.85,
          ox: cx + Math.cos(angle) * dist,
          oy: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
          radius: 1 + Math.random() * 2.2,
          hue: 188 + Math.random() * 20,
        };
      });
      entropyRef.current = 1;
    }

    resize();

    const onMove = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
      mouseRef.current.active = true;
    };
    const onDown = () => { mouseRef.current.pressing = true; };
    const onUp = () => { mouseRef.current.pressing = false; };
    const onLeave = () => { mouseRef.current.active = false; mouseRef.current.pressing = false; };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);

    function draw(time: number) {
      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);
      const ge = entropyRef.current;
      const breath = Math.sin((time % 10909) / 10909 * Math.PI * 2) * 0.5 + 0.5;
      const ps = particlesRef.current;
      const m = mouseRef.current;

      entropyRef.current = Math.max(0, ge - 0.00025);
      if (m.active) entropyRef.current = Math.max(0, ge - 0.0015);
      if (m.pressing) entropyRef.current = Math.max(0, ge - 0.005);

      for (const p of ps) {
        if (m.active) {
          const dx = p.x - m.x, dy = p.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = m.pressing ? 200 : 130;
          const inf = Math.max(0, 1 - dist / radius);
          if (inf > 0) {
            const f = m.pressing ? 0.03 : 0.01;
            p.vx += (p.ox - p.x) * f * inf;
            p.vy += (p.oy - p.y) * f * inf;
          }
        }
        const spring = 0.003 + (1 - ge) * 0.022;
        p.vx += (p.ox - p.x) * spring + (Math.random() - 0.5) * ge * 0.7;
        p.vy += (p.oy - p.y) * spring + (Math.random() - 0.5) * ge * 0.7;
        p.vx *= 0.92 + (1 - ge) * 0.035;
        p.vy *= 0.92 + (1 - ge) * 0.035;
        p.x += p.vx; p.y += p.vy;
      }

      const connDist = 50 + (1 - ge) * 45;
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < connDist) {
            ctx.beginPath();
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.strokeStyle = `rgba(80,180,210,${(1 - d / connDist) * (0.04 + (1 - ge) * 0.09) * (0.6 + breath * 0.4)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      for (const p of ps) {
        const pulse = Math.sin(time / 2800 + p.hue) * 0.5 + 0.5;
        const r = p.radius * (0.6 + (1 - ge) * 0.4 + pulse * 0.2);
        const a = 0.15 + (1 - ge) * 0.5 + pulse * 0.15;
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 4.5);
        glow.addColorStop(0, `hsla(${p.hue},42%,65%,${a * 0.18})`);
        glow.addColorStop(1, `hsla(${p.hue},42%,65%,0)`);
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 4.5, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},42%,72%,${a})`; ctx.fill();
      }

      if (ge < 0.3) {
        const cx = w / 2, cy = h / 2;
        const rG = (1 - ge) * 90 * (0.5 + breath * 0.5);
        const cG = ctx.createRadialGradient(cx, cy, 0, cx, cy, rG);
        cG.addColorStop(0, `rgba(80,180,210,${(1 - ge) * 0.03 * (0.5 + breath * 0.5)})`);
        cG.addColorStop(1, "rgba(80,180,210,0)");
        ctx.beginPath(); ctx.arc(cx, cy, rG, 0, Math.PI * 2); ctx.fillStyle = cG; ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    }
    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full block" style={{ touchAction: "none" }} />;
}

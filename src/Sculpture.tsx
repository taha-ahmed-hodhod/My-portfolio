import { useEffect, useRef, useState } from "react";
import { surfacePoint } from "./model";
export interface SculptureLabels {
  sculpture: string;
  hint: string;
  pause: string;
  play: string;
  paused: string;
  running: string;
  reduced: string;
  reset: string;
  specimen: string;
}
export function Sculpture({ labels: c }: { labels: SculptureLabels }) {
  const canvas = useRef<HTMLCanvasElement>(null),
    angle = useRef(0.4),
    formRef = useRef(0),
    paint = useRef<() => void>(() => {});
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [playing, setPlaying] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [form, setForm] = useState(0);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(media.matches);
      if (media.matches) setPlaying(false);
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const ctx = node.getContext("2d");
    if (!ctx) return;
    let width = 0,
      height = 0,
      raf = 0,
      last = 0,
      visible = true;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const scale = Math.min(width, height) * 0.29,
        a = angle.current,
        tilt = 0.91;
      const paths: { z: number; points: [number, number][]; alpha: number }[] =
        [];
      function project(
        x: number,
        y: number,
        z: number,
      ): [number, number, number] {
        const xx = x * Math.cos(a) - y * Math.sin(a),
          yy = x * Math.sin(a) + y * Math.cos(a);
        const yz = yy * Math.cos(tilt) - z * Math.sin(tilt),
          zz = yy * Math.sin(tilt) + z * Math.cos(tilt);
        const perspective = 3.8 / (3.8 - zz * 0.36);
        return [
          width / 2 + xx * scale * perspective,
          height / 2 + yz * scale * perspective,
          zz,
        ];
      }
      const isMobile = width < 600;
      const rings = isMobile ? 46 : 76;
      const ringSteps = isMobile ? 44 : 70;
      const radials = isMobile ? 14 : 22;
      const radialSteps = isMobile ? 84 : 140;

      for (let i = 0; i < rings; i++) {
        const pts: [number, number][] = [];
        let depth = 0;
        for (let j = 0; j <= ringSteps; j++) {
          const p = surfacePoint(
              (i / rings) * Math.PI * 2,
              (j / ringSteps) * Math.PI * 2,
              formRef.current,
            ),
            t = project(...p);
          pts.push([t[0], t[1]]);
          depth += t[2];
        }
        paths.push({ z: depth / (ringSteps + 1), points: pts, alpha: 0.3 });
      }
      for (let i = 0; i < radials; i++) {
        const pts: [number, number][] = [];
        let depth = 0;
        for (let j = 0; j <= radialSteps; j++) {
          const p = surfacePoint(
              (j / radialSteps) * Math.PI * 2,
              (i / radials) * Math.PI * 2,
              formRef.current,
            ),
            t = project(...p);
          pts.push([t[0], t[1]]);
          depth += t[2];
        }
        paths.push({ z: depth / (radialSteps + 1), points: pts, alpha: 0.17 });
      }
      paths
        .sort((p, q) => p.z - q.z)
        .forEach((p) => {
          ctx.beginPath();
          p.points.forEach(([x, y], i) =>
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
          );
          const intensity = Math.max(
            0.08,
            Math.min(0.83, p.alpha + (p.z + 1) * 0.25),
          );
          ctx.strokeStyle = "rgba(239,235,237," + intensity + ")";
          ctx.lineWidth = 0.65;
          ctx.stroke();
        });
    }
    paint.current = draw;
    const resize = () => {
      const rect = node.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const isMobile = width < 600;
      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
      node.width = Math.round(width * dpr);
      node.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(node);
    resize();

    const isRunning = () => playing && visible && !document.hidden;

    const tick = (time: number) => {
      if (!isRunning()) {
        raf = 0;
        return;
      }
      angle.current += Math.min(time - last, 40) * 0.00015;
      draw();
      last = time;
      raf = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (isRunning() && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) startLoop();
    });
    io.observe(node);

    const handleVisibility = () => {
      if (document.hidden) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      } else {
        startLoop();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    startLoop();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", handleVisibility);
      ro.disconnect();
      io.disconnect();
    };
  }, [playing]);
  const switchForm = () => {
    formRef.current = 1 - formRef.current;
    setForm(formRef.current);
    paint.current();
  };
  return (
    <div className="sculpture-wrap">
      <div className="specimen-meta">
        <span>{c.specimen}</span>
        <span>CANVAS · LIVE</span>
      </div>
      <button
        className="sculpture-button"
        aria-label={c.sculpture}
        onClick={switchForm}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            setPlaying(false);
            angle.current += event.key === "ArrowLeft" ? -0.15 : 0.15;
            paint.current();
          }
        }}
      >
        <canvas ref={canvas} aria-hidden="true" />
        <span className="sculpture-index">0{form + 1} / ∞</span>
        <span className="sculpture-cross">+</span>
      </button>
      <p className="sculpture-hint">{c.hint}</p>
      <div className="motion-controls">
        <span>
          <i className={playing ? "motion-dot is-live" : "motion-dot"} />
          {reduced ? c.reduced : playing ? c.running : c.paused}
        </span>
        <button onClick={() => setPlaying((v) => !v)}>
          {playing ? "Ⅱ" : "▷"} {playing ? c.pause : c.play}
        </button>
        <button
          onClick={() => {
            angle.current = 0.4;
            formRef.current = 0;
            setForm(0);
            setPlaying(false);
            paint.current();
          }}
        >
          {c.reset} ↺
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';

interface Props {
  done: boolean; // data finished loading
  name: string; // e.g. "TAHA HODHOD"
  tagline: string;
  onFinish: () => void;
}

export function LoadingScreen({ done, name, tagline, onFinish }: Props) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const letters = name.split('');

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      // ease towards 90 until data is ready, then sprint to 100
      const target = done ? 100 : Math.min(90, elapsed / 18);
      setProgress((p) => {
        const next = p + (target - p) * 0.08;
        return next > 99.4 && done ? 100 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  useEffect(() => {
    if (progress >= 100) {
      const t1 = setTimeout(() => setLeaving(true), 250);
      const t2 = setTimeout(onFinish, 1050);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [progress, onFinish]);

  return (
    <div className={'loader' + (leaving ? ' is-leaving' : '')} role="status" aria-label="Loading">
      <div className="loader-center">
        <p className="loader-tag">{tagline}</p>
        <h1 className="loader-name" aria-label={name}>
          
          {letters.map((ch, i) => (
            <span key={i} className="loader-letter" style={{ animationDelay: 0.05 * i + 's' }}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </h1>
        <div className="loader-bar">
          <div className="loader-bar-fill" style={{ width: progress + '%' }} />
        </div>
        <span className="loader-count">{Math.floor(progress)}</span>
      </div>
      <span className="loader-corner tl">✳</span>
      <span className="loader-corner br">✳</span>
    </div>
  );
}

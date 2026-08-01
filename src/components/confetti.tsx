"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  size: number;
  color: string;
  circle: boolean;
};

/**
 * One-shot celebration burst: 64 particles from the given viewport point,
 * single canvas layer, transform/alpha only, 1.1s life, then removed.
 * Reduced motion renders nothing (callers pair it with a gold badge).
 */
export function Confetti({ burstKey, origin }: { burstKey: number; origin: { x: number; y: number } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!burstKey || reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    const styles = getComputedStyle(document.documentElement);
    const colors = [
      styles.getPropertyValue("--color-accent").trim() || "#c8f050",
      styles.getPropertyValue("--color-accent-2").trim() || "#45e6d0",
      styles.getPropertyValue("--color-gold").trim() || "#edb84c",
      styles.getPropertyValue("--color-fg").trim() || "#f2f4f8",
    ];

    const particles: Particle[] = Array.from({ length: 64 }, () => {
      const angle = (-90 + (Math.random() * 70 - 35)) * (Math.PI / 180);
      const speed = 420 + Math.random() * 300;
      return {
        x: origin.x,
        y: origin.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rot: Math.random() * Math.PI,
        vrot: ((Math.random() * 2 - 1) * 540 * Math.PI) / 180,
        size: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        circle: Math.random() < 0.4,
      };
    });

    const LIFE = 1100;
    const start = performance.now();
    let raf = 0;
    let last = start;

    const frame = (t: number) => {
      const elapsed = t - start;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (elapsed > LIFE) return;

      const fade = elapsed > LIFE * 0.7 ? 1 - (elapsed - LIFE * 0.7) / (LIFE * 0.3) : 1;
      for (const p of particles) {
        p.vy += 1400 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.circle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [burstKey, origin, reduced]);

  if (reduced) return null;
  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{ width: "100vw", height: "100vh" }}
      aria-hidden
    />
  );
}

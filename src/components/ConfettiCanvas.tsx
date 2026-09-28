import React, { useEffect, useRef } from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: 'rect' | 'circle' | 'star';
  life: number;
  maxLife: number;
}

interface ConfettiCanvasProps {
  triggerCelebration: number; // Increment to trigger
  mode?: 'confetti' | 'fireworks';
}

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({ triggerCelebration, mode = 'confetti' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!triggerCelebration) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: ConfettiParticle[] = [];
    const colors = [
      '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6',
      '#EC4899', '#FCD34D', '#34D399', '#60A5FA', '#F43F5E'
    ];

    const count = mode === 'fireworks' ? 180 : 120;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const speed = mode === 'fireworks' ? (Math.random() * 8 + 4) : (Math.random() * 6 + 2);
      const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'circle', 'star'];

      particles.push({
        x: mode === 'fireworks' ? canvas.width * 0.5 + (Math.random() * 200 - 100) : Math.random() * canvas.width,
        y: mode === 'fireworks' ? canvas.height * 0.45 + (Math.random() * 100 - 50) : -10,
        vx: mode === 'fireworks' ? Math.cos(angle) * speed : Math.random() * 4 - 2,
        vy: mode === 'fireworks' ? Math.sin(angle) * speed : Math.random() * 4 + 3,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 0,
        maxLife: mode === 'fireworks' ? 140 : 160
      });
    }

    let animationId: number;

    const drawStar = (c: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fill();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particles) {
        if (p.life < p.maxLife) {
          alive = true;
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12; // gravity
          p.vx *= 0.985; // friction
          p.rotation += p.vRot;

          const alpha = Math.max(0, 1 - p.life / p.maxLife);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          } else if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            drawStar(ctx, 0, 0, 5, p.size, p.size * 0.5);
          }

          ctx.restore();
        }
      }

      if (alive) {
        animationId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [triggerCelebration, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};

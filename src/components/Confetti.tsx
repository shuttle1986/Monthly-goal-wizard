import { useEffect, useState } from 'react';

export default function Confetti() {
  const [particles, setParticles] = useState<
    { id: number; x: number; delay: number; color: string; size: number; shape: string }[]
  >([]);

  useEffect(() => {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e'];
    const shapes = ['50%', '3px', '30%'];
    const p = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 5 + Math.random() * 8,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            animationDelay: `${p.delay}s`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape,
          }}
        />
      ))}
    </div>
  );
}

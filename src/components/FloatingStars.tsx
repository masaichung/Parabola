import { motion } from 'motion/react';

interface FloatingStarsProps {
  cx: number; // SVG coordinate x
  cy: number; // SVG coordinate y
  color?: string;
}

const starsData = [
  { id: 1, angle: -60, delay: 0, scale: 0.8, distance: 40 },
  { id: 2, angle: -30, delay: 0.2, scale: 1.0, distance: 55 },
  { id: 3, angle: -90, delay: 0.1, scale: 0.7, distance: 48 },
  { id: 4, angle: -120, delay: 0.3, scale: 0.9, distance: 52 },
  { id: 5, angle: -150, delay: 0.15, scale: 0.6, distance: 35 },
];

export function FloatingStars({ cx, cy, color = '#EAB308' }: FloatingStarsProps) {
  return (
    <g>
      {starsData.map((star) => {
        // Calculate physics-like path for stars floating upwards
        const rad = (star.angle * Math.PI) / 180;
        const targetX = Math.cos(rad) * star.distance;
        const targetY = Math.sin(rad) * star.distance - 20; // Float upwards even more

        return (
          <motion.path
            key={star.id}
            d="M 0,-6 L 1.8,-1.8 L 6.2,-1.8 L 2.6,0.8 L 4,5.2 L 0,2.6 L -4,5.2 L -2.6,0.8 L -6.2,-1.8 L -1.8,-1.8 Z"
            fill={color}
            stroke="#ffffff"
            strokeWidth={0.5}
            initial={{ opacity: 0, scale: 0, x: cx, y: cy }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, star.scale, star.scale * 1.2, 0],
              x: cx + targetX,
              y: cy + targetY,
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              delay: star.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </g>
  );
}

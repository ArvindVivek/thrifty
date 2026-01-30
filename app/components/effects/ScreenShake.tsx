'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface ScreenShakeProps {
  active: boolean;
  children: ReactNode;
  intensity?: number; // pixels, default 4
  duration?: number; // ms, default 200
}

export function ScreenShake({
  active,
  children,
  intensity = 4,
  duration = 200
}: ScreenShakeProps) {
  return (
    <motion.div
      animate={active ? {
        x: [0, -intensity, intensity, -intensity, intensity, 0],
        y: [0, intensity, -intensity, intensity, -intensity, 0],
      } : { x: 0, y: 0 }}
      transition={{ duration: duration / 1000, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

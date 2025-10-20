/**
 * Laser Pointer
 * Animated laser pointer with glow effects
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LaserPointerProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

interface Position {
  x: number;
  y: number;
}

export function LaserPointer({ containerRef }: LaserPointerProps): React.JSX.Element {
  const [position, setPosition] = useState<Position | null>(null);
  const [isActive, setIsActive] = useState(false);
  const trailRef = useRef<Position[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if mouse is within bounds
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        setPosition({ x, y });
        setIsActive(true);

        // Add to trail
        trailRef.current = [...trailRef.current.slice(-10), { x, y }];
      } else {
        setIsActive(false);
      }
    };

    const handleMouseLeave = () => {
      setIsActive(false);
      trailRef.current = [];
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef]);

  if (!isActive || !position) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* Trail effect */}
      <AnimatePresence>
        {trailRef.current.slice(0, -1).map((pos, index) => {
          const opacity = (index + 1) / trailRef.current.length;
          const scale = 0.3 + opacity * 0.7;

          return (
            <motion.div
              key={`trail-${index}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: opacity * 0.4,
                scale,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: pos.x,
                top: pos.y,
                background:
                  'radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(239, 68, 68, 0) 70%)',
              }}
            />
          );
        })}
      </AnimatePresence>

      {/* Main laser pointer */}
      <motion.div
        className="absolute"
        style={{
          left: position.x,
          top: position.y,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div
            className="h-12 w-12 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, rgba(239, 68, 68, 0) 70%)',
              filter: 'blur(8px)',
            }}
          />
        </motion.div>

        {/* Middle glow */}
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0.5, 0.8],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div
            className="h-8 w-8 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(239, 68, 68, 0) 70%)',
              filter: 'blur(4px)',
            }}
          />
        </motion.div>

        {/* Core dot */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="h-3 w-3 rounded-full bg-red-500 shadow-2xl"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              boxShadow: '0 0 10px 2px rgba(239, 68, 68, 0.8), 0 0 20px 4px rgba(239, 68, 68, 0.4)',
            }}
          />
        </div>

        {/* Sparkle effect */}
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          animate={{
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div className="relative h-6 w-6">
            {[0, 45, 90, 135].map((angle) => (
              <motion.div
                key={angle}
                className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400"
                style={{
                  transform: `rotate(${angle}deg) translateY(-8px)`,
                }}
                animate={{
                  opacity: [0.8, 0.3, 0.8],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: angle * 0.05,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Click ripple effect */}
      <AnimatePresence>{/* This will be triggered on click events */}</AnimatePresence>
    </div>
  );
}

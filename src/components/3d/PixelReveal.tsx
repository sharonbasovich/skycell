
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PixelRevealProps {
  children: React.ReactNode;
  gridSize?: number;
  delay?: number;
  className?: string;
}

const PixelReveal = ({ children, gridSize = 20, delay = 0, className = "" }: PixelRevealProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);

  // Create grid of pixels
  const pixels = Array.from({ length: gridSize * gridSize }, (_, i) => {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    const randomDelay = Math.random() * 0.8;
    
    return (
      <motion.div
        key={i}
        className="absolute bg-background border border-border/20"
        style={{
          left: `${(col / gridSize) * 100}%`,
          top: `${(row / gridSize) * 100}%`,
          width: `${100 / gridSize}%`,
          height: `${100 / gridSize}%`,
        }}
        initial={{ opacity: 1, scale: 1 }}
        animate={isRevealed ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          delay: randomDelay,
          ease: "easeOut"
        }}
      />
    );
  });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      {/* Pixel overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {pixels}
      </div>
    </div>
  );
};

export default PixelReveal;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  duration?: number;
}

const LoadingScreen = ({ duration = 2500 }: LoadingScreenProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isLoading) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotateZ: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-6"
        >
          <img
            src="/lovable-uploads/b697c43f-db59-439a-b839-3d1c3534fcf2.png"
            alt="SkyCell Logo"
            className="w-32 h-32 object-contain"
          />
        </motion.div>

        <div className="flex items-center gap-2 mt-4">
          <motion.div
            className="h-2 w-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.2 }}
          />
          <motion.div
            className="h-2 w-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 0.4,
              delay: 0.2,
            }}
          />
          <motion.div
            className="h-2 w-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 0.4,
              delay: 0.4,
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;

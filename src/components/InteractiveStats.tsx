
import { useState, useEffect } from 'react';
import { motion, useInView } from 'react-intersection-observer';

const InteractiveStats = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const stats = [
    { 
      value: 30000, 
      suffix: 'm', 
      label: 'Maximum Altitude',
      icon: '↗️',
      color: 'text-blue-500'
    },
    { 
      value: 50, 
      suffix: 'km', 
      label: 'Communication Range',
      icon: '📡',
      color: 'text-green-500'
    },
    { 
      value: 12, 
      suffix: '', 
      label: 'Sensors Onboard',
      icon: '🔬',
      color: 'text-purple-500'
    },
    { 
      value: 6, 
      suffix: 'h', 
      label: 'Flight Duration',
      icon: '⏱️',
      color: 'text-orange-500'
    },
  ];

  return (
    <section ref={ref} className="relative py-20 px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold gradient-text mb-4">Project Achievements</h2>
          <p className="text-lg text-muted-foreground">Real performance metrics from our SkyCell missions</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ stat, index, inView }) => {
  const [count, setCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!inView) return;
    
    const timer = setTimeout(() => {
      let start = 0;
      const end = stat.value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(counter);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(counter);
    }, index * 200);

    return () => clearTimeout(timer);
  }, [inView, stat.value, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={inView ? { 
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        transition: { 
          delay: index * 0.2,
          duration: 0.8,
          type: "spring",
          stiffness: 100
        }
      } : { opacity: 0, y: 50, rotateX: -15 }}
      whileHover={{ 
        scale: 1.05,
        rotateY: 5,
        z: 20,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="text-center group cursor-pointer"
    >
      <motion.div
        className="bg-card/70 backdrop-blur-md rounded-xl p-6 shadow-lg border border-border/50 relative overflow-hidden"
        animate={isHovered ? { 
          background: "rgba(var(--card), 0.9)",
          borderColor: "hsl(var(--primary))"
        } : {}}
      >
        {/* Animated background gradient */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-20"
          animate={isHovered ? { 
            background: "linear-gradient(45deg, hsl(var(--primary)), hsl(var(--secondary)))",
            opacity: 0.1
          } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
        
        <motion.div
          className={`text-4xl mb-2 ${stat.color}`}
          animate={isHovered ? { 
            scale: 1.2,
            rotate: 360
          } : { 
            scale: 1,
            rotate: 0
          }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          {stat.icon}
        </motion.div>
        
        <motion.h3 
          className="text-3xl md:text-4xl font-bold text-primary mb-2"
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
        >
          {count.toLocaleString()}{stat.suffix}
        </motion.h3>
        
        <motion.p 
          className="text-muted-foreground"
          animate={isHovered ? { y: -2 } : { y: 0 }}
        >
          {stat.label}
        </motion.p>
        
        {/* Particle effects on hover */}
        <motion.div
          className="absolute top-0 left-0 w-2 h-2 bg-primary rounded-full opacity-0"
          animate={isHovered ? {
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [0, 100, 200],
            y: [0, -20, -40]
          } : { opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
};

export default InteractiveStats;

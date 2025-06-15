
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const InteractiveStats = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3,
  });

  const stats = [
    { 
      value: 30000, 
      suffix: 'm', 
      label: 'Maximum Altitude',
      icon: '↗️',
      color: 'text-blue-500',
      description: 'Reached new heights in stratospheric communication testing'
    },
    { 
      value: 50, 
      suffix: 'km', 
      label: 'Communication Range',
      icon: '📡',
      color: 'text-green-500',
      description: 'Established reliable mesh network connections across vast distances'
    },
    { 
      value: 12, 
      suffix: '', 
      label: 'Sensors Onboard',
      icon: '🔬',
      color: 'text-purple-500',
      description: 'Advanced sensor array for comprehensive atmospheric monitoring'
    },
    { 
      value: 6, 
      suffix: 'h', 
      label: 'Flight Duration',
      icon: '⏱️',
      color: 'text-orange-500',
      description: 'Continuous operation time during extended test flights'
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

const StatCard = ({ stat, index, inView }: { stat: any, index: number, inView: boolean }) => {
  const [count, setCount] = useState(0);

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
      className="text-center"
    >
      <div className="bg-card/70 backdrop-blur-md rounded-xl p-6 shadow-lg border border-border/50 h-48 flex flex-col justify-center items-center">
        <motion.div
          className={`text-3xl mb-3 ${stat.color}`}
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          {stat.icon}
        </motion.div>
        
        <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          {count.toLocaleString()}{stat.suffix}
        </h3>
        
        <h4 className="text-sm font-bold text-primary mb-2 text-center">
          {stat.label}
        </h4>
        
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          {stat.description}
        </p>
        
        <div className="mt-3 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-60"></div>
      </div>
    </motion.div>
  );
};

export default InteractiveStats;

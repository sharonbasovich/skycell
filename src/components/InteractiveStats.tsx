
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
  const [isFlipped, setIsFlipped] = useState(false);

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
      className="text-center group cursor-pointer animate-pulse-glow"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className="relative w-full h-48 transition-transform duration-700 preserve-3d"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transformOrigin: "center center"
        }}
      >
        {/* Front Face - SkyCell Logo */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-md rounded-xl p-6 shadow-lg border border-border/50 backface-hidden flex flex-col justify-center items-center relative overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              linear-gradient(45deg, transparent 49%, rgba(255, 255, 255, 0.1) 50%, transparent 51%)
            `,
            backgroundSize: '60px 60px, 60px 60px, 12px 12px'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-xl"></div>
          <img 
            src="/lovable-uploads/b89dce68-0265-49c8-ac6b-8f70061ff276.png" 
            alt="SkyCell Logo"
            className="w-20 h-20 object-contain opacity-90 relative z-10"
          />
        </div>

        {/* Back Face - Achievement Info */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-md rounded-xl p-6 shadow-lg border border-primary/30 backface-hidden flex flex-col justify-center items-center relative overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
              linear-gradient(45deg, transparent 49%, rgba(255, 255, 255, 0.1) 50%, transparent 51%)
            `,
            backgroundSize: '50px 50px, 50px 50px, 10px 10px'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-transparent rounded-xl"></div>
          <motion.div
            className={`text-3xl mb-3 ${stat.color} relative z-10`}
            animate={isFlipped ? { 
              scale: 1.1,
              rotate: 360
            } : { 
              scale: 1,
              rotate: 0
            }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            {stat.icon}
          </motion.div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2 relative z-10">
            {count.toLocaleString()}{stat.suffix}
          </h3>
          
          <h4 className="text-sm font-bold text-primary mb-2 text-center relative z-10">
            {stat.label}
          </h4>
          
          <p className="text-xs text-muted-foreground text-center leading-relaxed relative z-10">
            {stat.description}
          </p>
          
          <div className="mt-3 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-60 relative z-10"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveStats;

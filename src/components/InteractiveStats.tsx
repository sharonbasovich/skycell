
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
      value: 29831,
      suffix: " ft",
      label: "Maximum Altitude",
      icon: "🏔️",
      color: "text-blue-500",
      description: "Reached new heights in stratospheric communication testing",
    },
    {
      value: 70,
      suffix: "+ km",
      label: "Communication Range",
      icon: "📡",
      color: "text-green-500",
      description: "Established two-way communication using a mesh network",
    },
    {
      value: 3,
      suffix: "",
      label: "Sensors Onboard",
      icon: "🔬",
      color: "text-purple-500",
      description:
        "Sensors for monitoring temperature, humidity, altitude, and more",
    },
    {
      value: 4,
      suffix: "",
      label: "Team Members",
      icon: "🤝",
      color: "text-orange-500",
      description: "Created by four students as a part of HackClub's Apex",
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
          <h2 className="text-3xl font-bold gradient-text mb-4">Project Metrics</h2>
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
  const [flipCount, setFlipCount] = useState(0);
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

  // Counter animation for flip
  useEffect(() => {
    if (!isFlipped) return;

    let start = 0;
    const end = stat.value;
    const duration = 700; // Slightly shorter than flip duration
    const increment = end / (duration / 16);

    const flipCounter = setInterval(() => {
      start += increment;
      if (start >= end) {
        setFlipCount(end);
        clearInterval(flipCounter);
      } else {
        setFlipCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(flipCounter);
  }, [isFlipped, stat.value]);

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
      className="text-center group cursor-pointer"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => !isFlipped && setIsFlipped(true)}
    >
      <div
        className="relative w-full h-48 transition-transform duration-700 preserve-3d"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
        }}
      >
        {/* Front Face - SkyCell Logo */}
        <div
          className="absolute inset-0 bg-card/70 backdrop-blur-md rounded-xl p-6 shadow-lg border border-border/50 backface-hidden flex flex-col justify-center items-center hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)",
            boxShadow: "0 0 20px rgba(14, 165, 233, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 30px rgba(14, 165, 233, 0.2)"
          }}
        >
          <motion.div
            className="w-16 h-16 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              filter: "drop-shadow(0 0 8px rgba(14, 165, 233, 0.5))"
            }}
          >
            <img 
              src="/lovable-uploads/b87816ce-c243-460c-be26-1d87d2dabc9d.png" 
              alt="SkyCell Logo" 
              className="w-full h-full object-contain rounded-lg"
              style={{
                filter: "brightness(1.2) contrast(1.1)"
              }}
            />
          </motion.div>
        </div>

        {/* Back Face - Achievement Info */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-md rounded-xl p-6 shadow-lg border border-primary/30 backface-hidden flex flex-col justify-center items-center hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: "0 0 30px rgba(14, 165, 233, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 40px rgba(14, 165, 233, 0.4)"
          }}
        >
          <motion.div
            className={`text-3xl mb-3 ${stat.color}`}
            animate={isFlipped ? { 
              scale: 1.1,
              rotate: 360
            } : { 
              scale: 1,
              rotate: 0
            }}
            transition={{ duration: 0.5, type: "spring" }}
            style={{
              filter: "drop-shadow(0 0 10px rgba(14, 165, 233, 0.7))"
            }}
          >
            {stat.icon}
          </motion.div>
          
          <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2"
              style={{
                textShadow: "0 0 10px rgba(14, 165, 233, 0.5)"
              }}>
            {flipCount.toLocaleString()}{stat.suffix}
          </h3>
          
          <h4 className="text-sm font-bold text-primary mb-2 text-center">
            {stat.label}
          </h4>
          
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {stat.description}
          </p>
          
          <div className="mt-3 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full opacity-60"
               style={{
                 boxShadow: "0 0 8px rgba(14, 165, 233, 0.6)"
               }}></div>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractiveStats;

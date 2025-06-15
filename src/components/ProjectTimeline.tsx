import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Rocket } from 'lucide-react';

const ProjectTimeline = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const timelineItems = [
    {
      phase: "Phase 1",
      title: "Research & Design",
      date: "Q1 2024",
      description: "Initial research into high-altitude balloon technology and mesh networking protocols.",
      icon: "🔬",
      status: "completed"
    },
    {
      phase: "Phase 2", 
      title: "Planning",
      date: "Q2 2024",
      description: "Planning hardware through CAD and starting the software",
      icon: "🛠️",
      status: "completed"
    },
    {
      phase: "Phase 3",
      title: "Prototype Development",
      date: "Q3 2024",
      description: "Development of first working prototype with basic communication capabilities.",
      icon: "🚀",
      status: "in-progress"
    },
    {
      phase: "Phase 4",
      title: "Launch!",
      date: "Q4 2024",
      description: "Testing our payload on a HAB with Apex!",
      icon: "🎯",
      status: "planned"
    }
  ];

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <motion.section 
      ref={containerRef}
      className="relative py-20 px-4 overflow-hidden"
      style={{ y: backgroundY }}
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          background: "radial-gradient(circle at 50% 50%, hsl(var(--primary)) 0%, transparent 50%)"
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold gradient-text mb-4">Development Timeline</h2>
          <p className="text-lg text-muted-foreground">
            Our journey from concept to deployment
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <motion.div
            className="absolute left-8 top-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-full"
            initial={{ height: 0 }}
            animate={inView ? { height: "100%" } : { height: 0 }}
            transition={{ duration: 2, delay: 0.5 }}
          />

          {/* Rocket at bottom of timeline */}
          <motion.div
            className="absolute left-6 bottom-0 w-8 h-8 flex items-center justify-center transform translate-y-4"
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.8, delay: 2.5 }}
          >
            <motion.div
              className="text-primary"
              animate={{ 
                y: [0, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Rocket 
                size={24} 
                className="rotate-[225deg]" 
                fill="currentColor"
              />
            </motion.div>
          </motion.div>

          <div className="space-y-12">
            {timelineItems.map((item, index) => (
              <TimelineItem 
                key={index} 
                item={item} 
                index={index} 
                inView={inView}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const TimelineItem = ({ item, index, inView }: { item: any, index: number, inView: boolean }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'planned': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={inView ? { 
        opacity: 1, 
        x: 0,
        transition: { 
          delay: index * 0.3,
          duration: 0.8,
          type: "spring",
          stiffness: 100
        }
      } : { opacity: 0, x: -50 }}
      className="relative flex items-start gap-6"
    >
      {/* Timeline dot */}
      <motion.div
        className={`relative z-10 w-16 h-16 rounded-full ${getStatusColor(item.status)} flex items-center justify-center text-white text-2xl shadow-lg`}
        whileHover={{ scale: 1.1, rotate: 360 }}
        transition={{ duration: 0.5 }}
      >
        {item.icon}
        
        {/* Pulse effect for in-progress items */}
        {item.status === 'in-progress' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-500"
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Content card */}
      <motion.div
        className="flex-1 bg-card/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-border/50"
        whileHover={{ 
          scale: 1.02,
          y: -5,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-primary font-semibold text-sm">{item.phase}</span>
          <span className="text-muted-foreground text-sm">{item.date}</span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 gradient-text">{item.title}</h3>
        <p className="text-muted-foreground">{item.description}</p>

        {/* Progress indicator */}
        <motion.div
          className="mt-4 h-2 bg-accent rounded-full overflow-hidden"
          initial={{ width: 0 }}
          animate={inView ? { width: "100%" } : { width: 0 }}
          transition={{ delay: index * 0.3 + 0.5, duration: 1 }}
        >
          <motion.div
            className={`h-full ${getStatusColor(item.status)} rounded-full`}
            initial={{ width: 0 }}
            animate={inView ? { 
              width: item.status === 'completed' ? '100%' : 
                     item.status === 'in-progress' ? '60%' : '20%'
            } : { width: 0 }}
            transition={{ delay: index * 0.3 + 1, duration: 1.5 }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectTimeline;

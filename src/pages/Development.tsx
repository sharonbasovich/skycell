
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TimelineItem = ({ date, title, description, imageSrc, index }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <motion.div
      ref={ref}
      className={`flex flex-col md:flex-row gap-4 md:gap-8 ${
        index % 2 === 0 ? 'md:flex-row-reverse' : ''
      }`}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="md:w-1/2">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden border border-border/50 h-[250px]">
          <div className="bg-gradient-to-r from-skycell-blue to-skycell-purple w-full h-full opacity-70 flex items-center justify-center text-white font-bold">
            {/* Placeholder for actual images */}
            {imageSrc || "Development Phase Image"}
          </div>
        </div>
      </div>
      
      <div className="md:w-1/2 flex flex-col">
        <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 h-full">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            {date}
          </div>
          <h3 className="text-xl font-bold mb-3">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const LogEntry = ({ date, author, title, content }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <motion.div
      ref={ref}
      className="border-l-2 border-primary pl-4 py-2 mb-6"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-muted-foreground">{date}</span>
        <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
        <span className="text-xs font-medium">{author}</span>
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{content}</p>
    </motion.div>
  );
};

const Achievement = ({ title, description, icon }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  return (
    <motion.div
      ref={ref}
      className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const Development = () => {
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };
  
  const timelineData = [
    {
      date: "January 2024",
      title: "Project Inception",
      description: "Initial concept development and feasibility studies for the high-altitude mesh network system.",
      imageSrc: null
    },
    {
      date: "February 2024",
      title: "Prototype Design",
      description: "First CAD models and circuit designs completed for the main payload components.",
      imageSrc: null
    },
    {
      date: "March 2024",
      title: "Component Testing",
      description: "Individual subsystems tested in controlled environments to validate performance.",
      imageSrc: null
    },
    {
      date: "April 2024",
      title: "Integration & Assembly",
      description: "Full system integration with all components assembled into the final payload configuration.",
      imageSrc: null
    },
    {
      date: "May 2024",
      title: "Launch Preparation",
      description: "Pre-launch testing, calibration, and final safety checks before deployment.",
      imageSrc: null
    }
  ];
  
  const logEntries = [
    {
      date: "May 15, 2024",
      author: "Sarah Chen",
      title: "Radio Module Optimization",
      content: "Successfully improved range by 12% through antenna design modifications and power management updates. Testing confirms stable connections at distances up to 48km in clear weather conditions."
    },
    {
      date: "May 10, 2024",
      author: "David Williams",
      title: "Environmental Testing Complete",
      content: "Thermal vacuum chamber tests were successful. All systems remained functional from -65°C to +50°C and at pressures equivalent to 35km altitude. Battery performance exceeded expectations."
    },
    {
      date: "May 3, 2024",
      author: "Elena Rodriguez",
      title: "Software Update v2.3",
      content: "Deployed mesh routing algorithm improvements that reduce network convergence time by 40%. Added store-and-forward capabilities for intermittent connections."
    },
    {
      date: "April 28, 2024",
      author: "James Kim",
      title: "Solar Panel Integration",
      content: "New flexible solar panels installed and tested. They provide 5.2W at optimal angles, exceeding our power requirements by 30%. Weight added is minimal at just 42g."
    },
    {
      date: "April 15, 2024",
      author: "Priya Patel",
      title: "Payload Weight Reduction",
      content: "Redesigned housing using carbon fiber composites. Total weight reduced by 120g without compromising structural integrity. All structural tests passed with margins above 1.5x."
    }
  ];
  
  const achievements = [
    {
      title: "Maximum Altitude Record",
      description: "Reached 32,418 meters during test flight, breaking our previous altitude record.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 2 4 4-4 4 4 4-4 4 4 4-4 4"></path>
        </svg>
      )
    },
    {
      title: "Communication Distance",
      description: "Established reliable mesh link at 78km between ground and airborne nodes.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-9.33-5"></path>
          <path d="m21 11-2 2-2-2"></path>
          <path d="M6 16a6 6 0 0 0 9.33 5"></path>
          <path d="m3 13 2-2 2 2"></path>
        </svg>
      )
    },
    {
      title: "Power Efficiency",
      description: "Achieved 76 hours of continuous operation on a single battery charge.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1Z"></path>
          <path d="M10 3v4"></path>
          <path d="M14 3v4"></path>
          <path d="M10 13v-2"></path>
          <path d="M14 13v-2"></path>
          <path d="M10 17v-2"></path>
          <path d="M14 17v-2"></path>
        </svg>
      )
    },
    {
      title: "Data Collection",
      description: "Gathered over 2.3TB of atmospheric and communications data during test flights.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    }
  ];

  return (
    <motion.div
      className="pt-20"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4 gradient-text">Development Journey</h1>
          <p className="text-lg text-muted-foreground">
            Follow our progress from concept to launch as we build the SkyCell high-altitude mesh network platform.
          </p>
        </motion.div>
        
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="logs">Dev Logs</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="mt-4">
            <div className="space-y-16 md:space-y-24">
              {timelineData.map((item, index) => (
                <TimelineItem
                  key={index}
                  date={item.date}
                  title={item.title}
                  description={item.description}
                  imageSrc={item.imageSrc}
                  index={index}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="logs" className="mt-4">
            <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50">
              <h2 className="text-2xl font-bold mb-6">Development Logs</h2>
              <div className="space-y-2">
                {logEntries.map((entry, index) => (
                  <LogEntry
                    key={index}
                    date={entry.date}
                    author={entry.author}
                    title={entry.title}
                    content={entry.content}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <Achievement
                  key={index}
                  title={achievement.title}
                  description={achievement.description}
                  icon={achievement.icon}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <motion.div 
          className="mt-16 p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">Looking Forward</h2>
          <p className="text-muted-foreground mb-4">
            Our development continues as we prepare for the next phase of the SkyCell project. Future goals include:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Multi-balloon constellation for extended coverage</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Integration with satellite communication systems</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Advanced atmospheric data collection capabilities</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Open-source hardware and software releases</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Development;

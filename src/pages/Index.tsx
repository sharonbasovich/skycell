import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import BackgroundScene from '../components/3d/BackgroundScene';
import BalloonModel from '../components/3d/BalloonModel';
import ImageGallery from '../components/ImageGallery';
import InteractiveStats from '../components/InteractiveStats';
import ProjectTimeline from '../components/ProjectTimeline';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart } from 'lucide-react';

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 50, rotateX: -15 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -15 }}
      transition={{ duration: 0.8, delay, type: "spring", stiffness: 100 }}
      whileHover={{ 
        scale: 1.05,
        rotateY: 10,
        rotateX: 5,
        z: 50,
        transition: { duration: 0.4 }
      }}
      style={{ perspective: "1000px" }}
    >
      {/* 3D Card Container */}
      <div className="relative bg-gradient-to-br from-card/90 via-card/70 to-card/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-border/30 overflow-hidden transform-gpu transition-all duration-500 group-hover:shadow-[0_25px_50px_-12px_rgba(14,165,233,0.25)]">
        
        {/* Animated shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        </div>
        
        {/* Holographic border effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-sm animate-pulse" />
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/40 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <motion.div 
            className="mb-6 text-primary flex justify-center"
            whileHover={{ 
              scale: 1.2, 
              rotate: [0, 5, -5, 0],
              filter: "drop-shadow(0 0 15px rgba(14, 165, 233, 0.5))"
            }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            {icon}
          </motion.div>
          
          <motion.h3 
            className="text-xl font-bold mb-4 text-center bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
            whileHover={{ scale: 1.05 }}
          >
            {title}
          </motion.h3>
          
          <motion.p 
            className="text-muted-foreground text-center leading-relaxed"
            whileHover={{ y: -2 }}
          >
            {description}
          </motion.p>
        </div>
        
        {/* 3D depth effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent via-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-105" />
      </div>
    </motion.div>
  );
};

const StickyRevealSection = ({ children, className = "" }) => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);

  return (
    <motion.section
      ref={sectionRef}
      className={`sticky top-0 ${className}`}
      style={{ y, opacity, scale }}
    >
      {children}
    </motion.section>
  );
};

const Index = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Enhanced parallax effects
  const floatingY1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const floatingY2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const floatingY3 = useTransform(scrollYProgress, [0, 1], [0, -600]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 360]);

  return (
    <>
      <BackgroundScene />
      
      {/* Enhanced floating decorative elements */}
      <motion.div 
        className="fixed top-20 right-10 w-24 h-24 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl z-0"
        style={{ y: floatingY1, rotateX }}
        animate={{ 
          scale: [1, 1.3, 1], 
          rotate: [0, 180, 360],
          filter: ["blur(20px)", "blur(30px)", "blur(20px)"]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="fixed top-40 left-10 w-20 h-20 bg-gradient-to-r from-secondary/15 to-primary/15 rounded-full blur-2xl z-0"
        style={{ y: floatingY2 }}
        animate={{ 
          scale: [1.2, 1, 1.2], 
          rotate: [360, 180, 0],
          x: [0, 20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="fixed bottom-40 right-20 w-16 h-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-xl z-0"
        style={{ y: floatingY3 }}
        animate={{ 
          scale: [1, 1.5, 1], 
          rotate: [0, -180, -360],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Hero section with sticky reveal */}
      <StickyRevealSection className="min-h-screen flex flex-col justify-center items-center px-4 text-center z-10">
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: -50 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            SkyCell: Mesh Network Communication
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            A high-altitude balloon project creating a mesh network for enhanced aerial communications.
          </motion.p>
          
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link to="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-white">
                View Live Dashboard <BarChart className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/cad">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                Explore CAD Model <LineChart className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="32" 
            height="32" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-primary"
          >
            <path d="M12 5v14"></path>
            <path d="m19 12-7 7-7-7"></path>
          </svg>
        </motion.div>
      </StickyRevealSection>
      
      {/* About section with sticky reveal */}
      <StickyRevealSection className="py-20 px-4 z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div 
              className="h-[400px] relative"
              whileInView={{ 
                rotateY: [0, 15, 0],
                scale: [0.9, 1, 0.9]
              }}
              transition={{ duration: 3, ease: "easeInOut" }}
              viewport={{ once: true }}
            >
              <BalloonModel />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 gradient-text">About SkyCell</h2>
              <p className="text-lg mb-4 text-muted-foreground">
                SkyCell is a high-altitude balloon project designed to create a mesh network communication system that can cover vast areas from the stratosphere.
              </p>
              <p className="text-lg mb-6 text-muted-foreground">
                Using advanced RF technologies and custom-built hardware, our balloon can relay communications across challenging terrain while collecting valuable atmospheric data.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>Long-range mesh network communications</span>
                </li>
                <li className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>Real-time telemetry and data collection</span>
                </li>
                <li className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>High-altitude environmental research</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </StickyRevealSection>
      
      {/* Image Gallery with sticky reveal */}
      <StickyRevealSection className="z-10">
        <ImageGallery />
      </StickyRevealSection>
      
      {/* Enhanced Features section with 3D cards */}
      <StickyRevealSection className="py-20 px-4 bg-gradient-to-br from-accent/30 to-background z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold gradient-text mb-6">Key Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our SkyCell project combines cutting-edge technologies to create a versatile aerial communications platform with unprecedented capabilities.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="4"></circle>
                  <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                  <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                  <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                  <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                  <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
                </svg>
              }
              title="Mesh Network"
              description="Our proprietary mesh protocol enables dynamic node-to-node communication across vast distances with minimal infrastructure."
              delay={0.1}
            />
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"></path>
                  <path d="M17.64 15 22 10.64"></path>
                  <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"></path>
                </svg>
              }
              title="DIY Friendly"
              description="SkyCell can be built using readily available off-the-shelf components, making it accessible for enthusiasts, researchers, and educational institutions."
              delay={0.2}
            />
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              }
              title="Live Telemetry"
              description="Comprehensive sensor suite provides real-time data on position, altitude, temperature, pressure, and communications status, along with captured images from above."
              delay={0.3}
            />
          </div>
        </div>
      </StickyRevealSection>
      
      {/* Interactive Stats with sticky reveal */}
      <StickyRevealSection className="z-10">
        <InteractiveStats />
      </StickyRevealSection>
      
      {/* Project Timeline with sticky reveal */}
      <StickyRevealSection className="z-10">
        <ProjectTimeline />
      </StickyRevealSection>
      
      {/* Enhanced CTA section */}
      <StickyRevealSection className="py-20 px-4 bg-gradient-to-r from-skycell-blue/20 to-skycell-purple/20 overflow-hidden z-10">
        {/* ... keep existing code (CTA section content) */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, hsl(var(--primary)/.1) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 100%, hsl(var(--secondary)/.1) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 0%, hsl(var(--primary)/.1) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.h2
            className="text-3xl font-bold mb-6 gradient-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Ready to Explore SkyCell?
          </motion.h2>
          
          <motion.p
            className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Check out our interactive 3D models, development process, and live dashboard to learn more about this cutting-edge project.
          </motion.p>
          
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Link to="/cad">
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-white">
                View 3D Models
              </Button>
            </Link>
            <Link to="/development">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                Development Process
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                Live Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </StickyRevealSection>
      
      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/b89dce68-0265-49c8-ac6b-8f70061ff276.png" 
                  alt="SkyCell Logo" 
                  className="w-8 h-8 object-contain" 
                />
                <span className="text-lg font-bold gradient-text">SkyCell</span>
              </Link>
            </div>
            
            <div className="flex gap-6">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/cad" className="text-muted-foreground hover:text-primary transition-colors">
                CAD Models
              </Link>
              <Link to="/development" className="text-muted-foreground hover:text-primary transition-colors">
                Development
              </Link>
              <Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SkyCell Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Index;

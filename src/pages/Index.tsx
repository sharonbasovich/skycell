import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import BackgroundScene from '../components/3d/BackgroundScene';
import BalloonModel from '../components/3d/BalloonModel';
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
      className="bg-card/50 backdrop-blur-md rounded-xl p-6 shadow-lg border border-border/50"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="mb-4 text-primary">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
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

  return (
    <>
      <BackgroundScene />
      
      {/* Hero section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center items-center px-4 text-center"
        style={{ opacity, scale, y }}
      >
        <motion.div
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
      </motion.section>
      
      {/* About section */}
      <motion.section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="h-[400px]">
              <BalloonModel />
            </div>
            
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
      </motion.section>
      
      {/* Features section */}
      <section className="relative py-20 px-4 bg-accent/50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold gradient-text">Key Features</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Our SkyCell project combines cutting-edge technologies to create a versatile aerial communications platform.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v8"></path>
                  <path d="m4.93 10.93 1.41 1.41"></path>
                  <path d="M2 18h2"></path>
                  <path d="M20 18h2"></path>
                  <path d="m19.07 10.93-1.41 1.41"></path>
                  <path d="M22 22H2"></path>
                  <path d="M16 6 7 22"></path>
                  <path d="m8 6 9 16"></path>
                </svg>
              }
              title="Solar Powered"
              description="High-efficiency solar panels keep our system operational for extended missions without needing battery replacement."
              delay={0.2}
            />
            <FeatureCard
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              }
              title="Live Telemetry"
              description="Comprehensive sensor suite provides real-time data on position, altitude, temperature, pressure, and communications status."
              delay={0.3}
            />
          </div>
        </div>
      </section>
      
      {/* Stats section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-primary">30km+</h3>
              <p className="text-muted-foreground mt-2">Maximum Altitude</p>
            </motion.div>
            
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-primary">50km</h3>
              <p className="text-muted-foreground mt-2">Communication Range</p>
            </motion.div>
            
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-primary">10+</h3>
              <p className="text-muted-foreground mt-2">Sensors Onboard</p>
            </motion.div>
            
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl font-bold text-primary">8hr</h3>
              <p className="text-muted-foreground mt-2">Flight Duration</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-skycell-blue/20 to-skycell-purple/20">
        <div className="container mx-auto max-w-4xl text-center">
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
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-skycell-blue to-skycell-purple rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
              <span className="text-lg font-bold gradient-text">SkyCell</span>
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

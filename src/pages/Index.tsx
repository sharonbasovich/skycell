import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link, useLocation } from "react-router-dom";
import BackgroundScene from "../components/3d/BackgroundScene";
import BalloonModel from "../components/3d/BalloonModel";
import ImageGallery from "../components/ImageGallery";
import InteractiveStats from "../components/InteractiveStats";
import ProjectTimeline from "../components/ProjectTimeline";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart } from "lucide-react";

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  return (
    <motion.div
      ref={ref}
      className="relative bg-card/50 backdrop-blur-md rounded-xl p-6 shadow-lg border border-border/50 overflow-hidden group perspective-1000"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        backdropFilter: "blur(10px)",
        border: "1px solid transparent",
        backgroundImage: `
          linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%),
          linear-gradient(45deg, #0284C7, #7C3AED, #0284C7, #7C3AED)
        `,
        backgroundOrigin: "border-box",
        backgroundClip: "content-box, border-box",
        backgroundSize: "100% 100%, 400% 400%",
        animation: "holographic-border 4s ease-in-out infinite",
      }}
      initial={{
        opacity: 0,
        y: 20,
        rotateX: -15,
      }}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
              rotateX: 0,
            }
          : {
              opacity: 0,
              y: 20,
              rotateX: -15,
            }
      }
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        rotateX: 5,
        z: 20,
        transition: {
          duration: 0.3,
        },
      }}
    >
      {/* Animated white border on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          {/* Top border with rounded top corners */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out rounded-t-xl" />

          {/* Right border with rounded right corners */}
          <div className="absolute top-0 right-0 bottom-0 w-0.5 bg-white transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out delay-500 rounded-r-xl" />

          {/* Bottom border with rounded bottom corners */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out delay-1000 rounded-b-xl" />

          {/* Left border with rounded left corners */}
          <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out delay-1500 rounded-l-xl" />
        </div>
      </div>

      {/* Animated shine overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(45deg, transparent 30%, rgba(2, 132, 199, 0.2) 50%, transparent 70%)",
          transform: "translateX(-100%)",
          animation: "shine-sweep 2s ease-in-out infinite",
        }}
      />

      {/* 3D highlight effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(135deg, rgba(2, 132, 199, 0.1) 0%, transparent 50%, rgba(124, 58, 237, 0.1) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(2, 132, 199, 0.2), inset 0 -1px 0 rgba(0,0,0,0.1)",
        }}
      />

      <motion.div
        whileHover={{
          scale: 1.2,
          rotate: 5,
        }}
        transition={{
          duration: 0.3,
        }}
        className="relative z-10 mb-4 mx-[10px] my-[7px] text-white"
      >
        {icon}
      </motion.div>
      <h3 className="relative z-10 text-xl font-bold mb-2 px-[16px] text-white">
        {title}
      </h3>
      <p className="relative z-10 text-white/80 my-[11px] px-[18px]">
        {description}
      </p>
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

  // Parallax effect for floating elements
  const floatingY1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const floatingY2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const floatingY3 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const location = useLocation();
  const handleNavClick = (path: string, e: React.MouseEvent) => {
    if (location.pathname === path) {
      e.preventDefault();
      scrollToTop();
    }
  };
  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      scrollToTop();
    }
  };
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <>
      {/* Add custom CSS for animations */}
      <style>
        {`
          @keyframes holographic-border {
            0% { background-position: 0% 0%, 0% 0%; }
            50% { background-position: 0% 0%, 100% 100%; }
            100% { background-position: 0% 0%, 0% 0%; }
          }
          
          @keyframes shine-sweep {
            0% { transform: translateX(-100%) skewX(-25deg); }
            50% { transform: translateX(100%) skewX(-25deg); }
            100% { transform: translateX(100%) skewX(-25deg); }
          }
          
          @keyframes border-travel {
            0% {
              background-position: 0 0, 100% 0, 100% 100%, 0 100%;
            }
            25% {
              background-position: 100% 0, 100% 0, 100% 100%, 0 100%;
            }
            50% {
              background-position: 100% 0, 100% 100%, 100% 100%, 0 100%;
            }
            75% {
              background-position: 100% 0, 100% 100%, 0 100%, 0 100%;
            }
            100% {
              background-position: 0 0, 100% 100%, 0 100%, 0 0;
            }
          }
          
          .perspective-1000 {
            perspective: 1000px;
          }
        `}
      </style>

      <BackgroundScene />

      {/* Floating decorative elements */}
      <motion.div
        className="fixed top-20 right-10 w-20 h-20 bg-primary/10 rounded-full blur-xl z-0"
        style={{
          y: floatingY1,
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="fixed top-40 left-10 w-16 h-16 bg-secondary/10 rounded-full blur-xl z-0"
        style={{
          y: floatingY2,
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="fixed bottom-40 right-20 w-12 h-12 bg-primary/5 rounded-full blur-xl z-0"
        style={{
          y: floatingY3,
        }}
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, -180, -360],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Hero section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center items-center px-4 text-center"
        style={{
          opacity,
          scale,
          y,
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: -50,
          }}
          animate={
            heroInView
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {
                  opacity: 0,
                  y: -50,
                }
          }
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="max-w-3xl mx-auto relative"
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={
              heroInView
                ? {
                    opacity: 1,
                    y: 0,
                  }
                : {
                    opacity: 0,
                    y: 20,
                  }
            }
            transition={{
              duration: 0.8,
              delay: 0.3,
            }}
            className="mb-12"
          >
            <img
              src="/lovable-uploads/upscaled.png"
              alt="SkyCell Logo"
              className="w-full max-w-[605px] mx-auto h-auto object-contain"
            />
          </motion.div>

          {/* Removed description text */}

          <motion.div
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 animate-bounce"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 1.5,
              duration: 1,
            }}
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
        </motion.div>
      </motion.section>

      {/* About section with enhanced animations */}
      <motion.section
        className="relative py-20 px-4"
        initial={{
          opacity: 0,
        }}
        whileInView={{
          opacity: 1,
        }}
        transition={{
          duration: 1,
        }}
        viewport={{
          once: true,
        }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <motion.div
              className="h-[400px] relative"
              whileInView={{
                rotateY: [0, 10, 0],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
              }}
              viewport={{
                once: true,
              }}
            >
              <BalloonModel orbitAngleOffset={Math.PI/2} scale={6} />
            </motion.div>

            <motion.div
              initial={{
                opacity: 0,
                x: 100,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
              }}
              viewport={{
                once: true,
              }}
            >
              <h2 className="text-3xl font-bold mb-6 gradient-text">
                About SkyCell
              </h2>
              <p className="text-lg mb-4 text-muted-foreground">
                SkyCell was created for Hackclub's Apex hackathon. It is a
                high-altitude balloon experiment testing a mesh network
                communication system.
              </p>
              <p className="text-lg mb-6 text-muted-foreground">
                Skycell aims to provide an affordable communications system that
                can be quickly established in disaster relief situations to
                provide a temporary communications system using off-the-shelf
                components.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>Long-range mesh network communications</span>
                </li>
                <li className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>Real-time telemetry and data collection</span>
                </li>
                <li className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5"></path>
                    </svg>
                  </div>
                  <span>Affordable and off-the-shelf components</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Image Gallery Section */}
      <ImageGallery />

      {/* Features section with enhanced animations */}
      <section className="relative py-20 px-4 bg-accent/50">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            viewport={{
              once: true,
            }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold gradient-text">Key Features</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Our SkyCell project combines cutting-edge technologies to create a
              versatile aerial communications platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="px-0 mx-0 my-0"
                >
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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
      </section>

      {/* Interactive Stats section */}
      <InteractiveStats />

      {/* Project Timeline */}
      <ProjectTimeline />

      {/* Enhanced CTA section */}
      <motion.section
        className="relative py-20 px-4 bg-gradient-to-r from-skycell-blue/20 to-skycell-purple/20 overflow-hidden"
        whileInView={{
          scale: [0.95, 1],
        }}
        transition={{
          duration: 0.8,
        }}
        viewport={{
          once: true,
        }}
      >
        {/* Animated background particles */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, hsl(var(--primary)/.1) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 100%, hsl(var(--secondary)/.1) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 0%, hsl(var(--primary)/.1) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.h2
            className="text-3xl font-bold mb-6 gradient-text"
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            viewport={{
              once: true,
            }}
          >
            Ready to Explore SkyCell?
          </motion.h2>

          <motion.p
            className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
            viewport={{
              once: true,
            }}
          >
            Check out our interactive 3D models, development process, and live
            dashboard to learn more about this cutting-edge project.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.2,
            }}
            viewport={{
              once: true,
            }}
          >
            <Link to="/development">
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10"
              >
                Development Process
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10"
              >
                Live Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative py-10 px-4 border-t border-border z-20">
        <div className="container mx-auto max-w-6xl relative z-30">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Link
                to="/"
                className="flex items-center gap-2"
                onClick={handleLogoClick}
              >
                <img
                  src="/lovable-uploads/b89dce68-0265-49c8-ac6b-8f70061ff276.png"
                  alt="SkyCell Logo"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-lg font-bold gradient-text">SkyCell</span>
              </Link>
            </div>

            <div className="flex gap-6">
              <Link
                to="/"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => handleNavClick("/", e)}
              >
                Home
              </Link>
              <Link
                to="/development"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => handleNavClick("/development", e)}
              >
                Development
              </Link>
              <Link
                to="/dashboard"
                className="text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => handleNavClick("/dashboard", e)}
              >
                Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} SkyCell Project. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};
export default Index;

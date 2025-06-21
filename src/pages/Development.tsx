import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

const InteractiveTimelineItem = ({
  date,
  title,
  description,
  imageSrc,
  index,
  progress = 100,
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      ref={ref}
      className={`flex flex-col md:flex-row gap-4 md:gap-8 ${
        index % 2 === 0 ? "md:flex-row-reverse" : ""
      }`}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div className="md:w-1/2">
        <motion.div
          className="bg-card/50 backdrop-blur-sm rounded-xl overflow-hidden border border-border/50 h-[250px] cursor-pointer group"
          whileHover={{ scale: 1.02, rotateY: 5 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-r from-skycell-blue to-skycell-purple w-full h-full opacity-70 flex items-center justify-center text-white font-bold relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
            <span className="relative z-10">
              {imageSrc || "Development Phase Image"}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="md:w-1/2 flex flex-col">
        <motion.div
          className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 h-full"
          whileHover={{
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {date}
            </Badge>
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-primary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </motion.button>
          </div>

          <h3 className="text-xl font-bold mb-3">{title}</h3>
          <Progress value={progress} className="mb-3" />
          <p className="text-muted-foreground">{description}</p>

          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isExpanded ? "auto" : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-border/50">
              <h4 className="font-semibold mb-2">Technical Details:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Advanced sensor integration</li>
                <li>• Real-time data processing</li>
                <li>• Mesh network optimization</li>
                <li>• Environmental testing protocols</li>
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const InteractiveLogEntry = ({
  date,
  author,
  title,
  content,
  isNew = false,
}) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      ref={ref}
      className="border-l-2 border-primary pl-4 py-2 mb-6 cursor-pointer group"
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      onClick={() => setIsExpanded(!isExpanded)}
      whileHover={{ x: 5 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-muted-foreground">{date}</span>
        <div className="h-1 w-1 bg-muted-foreground rounded-full"></div>
        <span className="text-xs font-medium">{author}</span>
        {isNew && (
          <Badge
            variant="secondary"
            className="text-xs bg-green-100 text-green-800"
          >
            New
          </Badge>
        )}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        </motion.div>
      </div>
      <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="text-sm text-muted-foreground">{content}</p>
      </motion.div>
    </motion.div>
  );
};

const InteractiveAchievement = ({ title, description, icon, value, unit }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isAnimating, setIsAnimating] = useState(false);

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000); // Stop animation after 1 second
  };

  return (
    <motion.div
      ref={ref}
      className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50 group cursor-pointer"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, rotateY: 5 }}
      onHoverStart={triggerAnimation}
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div
          className="text-primary"
          animate={
            isAnimating
              ? {
                  rotateZ: [0, 360],
                  scale: [1, 1.2, 1],
                }
              : {
                  rotateZ: 0,
                  scale: 1,
                }
          }
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
        >
          {icon}
        </motion.div>
        <motion.div
          className="text-2xl font-bold text-primary"
          animate={{ scale: isAnimating ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, repeat: 0 }}
        >
          {value} {unit}
        </motion.div>
      </div>
      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const Development = () => {
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const timelineData = [
    {
      date: "January 2024",
      title: "Project Inception",
      description:
        "Initial concept development and feasibility studies for the high-altitude mesh network system.",
      imageSrc: null,
      progress: 100,
    },
    {
      date: "February 2024",
      title: "Prototype Design",
      description:
        "First CAD models and circuit designs completed for the main payload components.",
      imageSrc: null,
      progress: 100,
    },
    {
      date: "March 2024",
      title: "Component Testing",
      description:
        "Individual subsystems tested in controlled environments to validate performance.",
      imageSrc: null,
      progress: 100,
    },
    {
      date: "April 2024",
      title: "Integration & Assembly",
      description:
        "Full system integration with all components assembled into the final payload configuration.",
      imageSrc: null,
      progress: 85,
    },
    {
      date: "May 2024",
      title: "Launch Preparation",
      description:
        "Pre-launch testing, calibration, and final safety checks before deployment.",
      imageSrc: null,
      progress: 60,
    },
  ];

  const logEntries = [
    {
      date: "June 18, 2025",
      author: "Patricio",
      title: "Final Tests",
      content:
        "Apex is in two days! The meshtastic network is working and the packaging is complete",
      isNew: true,
    },
    {
      date: "May 19, 2025",
      author: "Agniva",
      title: "Booking our flights!",
      content: "It's official, we are flying to Boston in a month!",
      isNew: true,
    },
    {
      date: "May 17, 2025",
      author: "Sharon",
      title: "Skycell.tech",
      content:
        "We got a free domain and began working on our project showcase website",
      isNew: true,
    },
    {
      date: "May 11, 2025",
      author: "Agniva",
      title: "Telemetry dashboard",
      content:
        "Created a dashbaord to graph and log live telemetry from payload",
      isNew: true,
    },
    {
      date: "May 5, 2025",
      author: "Agniva",
      title: "Our first grant!",
      content: "We got our first $100 grant!",
      isNew: true,
    },
    {
      date: "April 5, 2025",
      author: "Meddy",
      title: "Proposal Approved!",
      content: "Our proposal was approved today, and we began delegating tasks",
      isNew: true,
    },
    {
      date: "March 30, 2025",
      author: "Meddy",
      title: "Proposal Submitted",
      content:
        "We submitted our proposal complete with a full report, BOM, and CAD",
      isNew: true,
    },
    {
      date: "March, 17 2025",
      author: "Sharon",
      title: "Team Formed!",
      content:
        "We formed a team of 4 students from across the US and Canada to work on our Apex project!",
      isNew: true,
    },
  ];

  const achievements = [
    {
      title: "Maximum Altitude Record",
      description:
        "Reached 32,418 meters during test flight, breaking our previous altitude record.",
      value: "32,418",
      unit: "m",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m12 2 4 4-4 4 4 4-4 4 4 4-4 4"></path>
        </svg>
      ),
    },
    {
      title: "Communication Distance",
      description:
        "Established reliable mesh link at 78km between ground and airborne nodes.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8a6 6 0 0 0-9.33-5"></path>
          <path d="m21 11-2 2-2-2"></path>
          <path d="M6 16a6 6 0 0 0 9.33 5"></path>
          <path d="m3 13 2-2 2 2"></path>
        </svg>
      ),
    },
    {
      title: "Power Efficiency",
      description:
        "Achieved 76 hours of continuous operation on a single battery charge.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1Z"></path>
          <path d="M10 3v4"></path>
          <path d="M14 3v4"></path>
          <path d="M10 13v-2"></path>
          <path d="M14 13v-2"></path>
          <path d="M10 17v-2"></path>
          <path d="M14 17v-2"></path>
        </svg>
      ),
    },
    {
      title: "Data Collection",
      description:
        "Gathered over 2.3TB of atmospheric and communications data during test flights.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
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
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Development Journey
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Follow our progress from concept to launch as we build the SkyCell
            high-altitude mesh network platform.
          </p>

          {/* Buttons removed */}
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
                <InteractiveTimelineItem
                  key={index}
                  date={item.date}
                  title={item.title}
                  description={item.description}
                  imageSrc={item.imageSrc}
                  progress={item.progress}
                  index={index}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="mt-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl">Development Logs</CardTitle>
                <CardDescription>
                  Latest updates and progress reports from our development team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {logEntries.map((entry, index) => (
                    <InteractiveLogEntry
                      key={index}
                      date={entry.date}
                      author={entry.author}
                      title={entry.title}
                      content={entry.content}
                      isNew={entry.isNew}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <InteractiveAchievement
                  key={index}
                  title={achievement.title}
                  description={achievement.description}
                  icon={achievement.icon}
                  value={achievement.value}
                  unit={achievement.unit}
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
            Although we are proud of the progress from our first prototype,
            Skycell still has more room for growth:
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
              <span>More streamlined software for production use</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Optimizing hardware for efficacy and affordability</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Development;

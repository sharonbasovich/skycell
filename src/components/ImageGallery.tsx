import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";

const ImageGallery = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Local gallery images from the public/gallery folder
  const images = [
    "/gallery/PXL_20250611_170737813.MP.jpg",
    "/gallery/PXL_20250611_170734721.MP.jpg",
    "/gallery/PXL_20250611_165029317.MP.jpg",
    "/gallery/IMG_0338.jpg",
    "/gallery/PXL_20250612_173202946.MP.jpg",
    "/gallery/PXL_20250614_005833983.MP.jpg",
    "/gallery/PXL_20250616_173452433.MP.jpg",
    "/gallery/IMG_0356.jpg",
    "/gallery/PXL_20250619_171928093.MP.jpg",
  ];

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <motion.section
      ref={containerRef}
      className="relative py-20 px-4"
      style={{ y }}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold gradient-text mb-4">
            Project Gallery
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore stunning aerial photography and development milestones from
            our SkyCell project
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => {
            const [imageRef, imageInView] = useInView({
              triggerOnce: false,
              threshold: 0.3,
              rootMargin: "-10% 0px -10% 0px",
            });

            return (
              <motion.div
                key={index}
                ref={imageRef}
                initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
                animate={
                  inView
                    ? {
                        opacity: imageInView ? 1 : 0.3,
                        scale: 1,
                        rotateY: 0,
                        transition: {
                          delay: index * 0.1,
                          duration: 0.6,
                          type: "spring",
                          stiffness: 100,
                        },
                      }
                    : { opacity: 0, scale: 0.8, rotateY: 45 }
                }
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  transition: {
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  },
                }}
                className="relative group cursor-pointer"
              >
                {/* Glow effect background */}
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-0 group-hover:opacity-100 blur-xl scale-110"
                  transition={{ duration: 0.3 }}
                />

                <div className="relative overflow-hidden rounded-xl bg-card shadow-lg border border-border/50 transform-gpu">
                  <motion.img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-64 object-cover"
                    whileHover={{
                      scale: 1.1,
                      filter: "brightness(1.1) contrast(1.1)",
                      transition: { duration: 0.4 },
                    }}
                  />

                  {/* Animated gradient overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20"
                    initial={{ opacity: 0, scale: 1.2 }}
                    whileHover={{
                      opacity: 1,
                      scale: 1,
                      transition: { duration: 0.3 },
                    }}
                  />

                  {/* Floating particles effect */}
                  <motion.div
                    className="absolute inset-0 overflow-hidden rounded-xl"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      className="absolute top-2 left-2 w-2 h-2 bg-primary rounded-full"
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0,
                      }}
                    />
                    <motion.div
                      className="absolute top-4 right-4 w-1.5 h-1.5 bg-secondary rounded-full"
                      animate={{
                        y: [0, -8, 0],
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        delay: 0.5,
                      }}
                    />
                    <motion.div
                      className="absolute bottom-3 left-3 w-1 h-1 bg-primary/60 rounded-full"
                      animate={{
                        y: [0, -6, 0],
                        opacity: [0.4, 0.9, 0.4],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        delay: 1,
                      }}
                    />
                  </motion.div>

                  {/* Animated border */}
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-transparent"
                    whileHover={{
                      borderColor: "hsl(var(--primary))",
                      boxShadow: "0 0 20px rgba(2, 132, 199, 0.3)",
                      transition: { duration: 0.3 },
                    }}
                  />

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                      transform: "translateX(-100%)",
                    }}
                    whileHover={{
                      x: ["-100%", "100%"],
                      transition: { duration: 0.8, ease: "easeInOut" },
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default ImageGallery;

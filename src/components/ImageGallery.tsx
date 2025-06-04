
import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const ImageGallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Sample balloon/sky images for the gallery
  const images = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=400&fit=crop"
  ];

  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]);

  return (
    <motion.section 
      ref={containerRef}
      className="relative py-20 px-4 bg-gradient-to-b from-background to-accent/30"
      style={{ y, opacity }}
    >
      <div className="container mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold gradient-text mb-4">Project Gallery</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore stunning aerial photography and development milestones from our SkyCell project
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
              animate={inView ? { 
                opacity: 1, 
                scale: 1, 
                rotateY: 0,
                transition: { 
                  delay: index * 0.1,
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }
              } : { opacity: 0, scale: 0.8, rotateY: 45 }}
              whileHover={{ 
                scale: 1.05,
                rotateY: -5,
                rotateX: 5,
                z: 50,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer perspective-1000"
              onClick={() => setSelectedImage(selectedImage === index ? null : index)}
            >
              <div className="relative overflow-hidden rounded-xl bg-card shadow-lg border border-border/50 transform-gpu">
                <motion.img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  whileHover={{ filter: "brightness(1.1)" }}
                />
                
                {/* Vertex transform overlay effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20"
                  initial={{ opacity: 0, scale: 1.2 }}
                  whileHover={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { duration: 0.3 }
                  }}
                />
                
                {/* Interactive corners */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content overlay */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                >
                  <p className="text-white font-semibold text-lg">View Image</p>
                </motion.div>
              </div>
              
              {/* Expanded view */}
              <motion.div
                initial={false}
                animate={selectedImage === index ? { 
                  height: "auto",
                  opacity: 1,
                  marginTop: 16
                } : { 
                  height: 0,
                  opacity: 0,
                  marginTop: 0
                }}
                className="overflow-hidden bg-card/80 backdrop-blur rounded-lg border border-border/50"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Image {index + 1}</h3>
                  <p className="text-muted-foreground text-sm">
                    High-altitude photography captured during SkyCell development and testing phases.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default ImageGallery;

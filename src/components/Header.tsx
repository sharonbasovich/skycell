
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'CAD Viewer', path: '/cad' },
    { name: 'Development', path: '/development' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <motion.header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/b697c43f-db59-439a-b839-3d1c3534fcf2.png" 
              alt="SkyCell Logo" 
              className="w-12 h-12 object-contain" 
            />
            <span className="text-xl font-bold gradient-text">SkyCell</span>
          </Link>
        </motion.div>
        
        <nav className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={`text-sm font-medium ${
                  location.pathname === item.path 
                    ? 'text-primary font-bold' 
                    : 'text-foreground'
                }`}>
                  {item.name}
                </span>
                {location.pathname === item.path && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                    layoutId="navIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          ))}
        </nav>
        
        <motion.div 
          className="md:hidden flex items-center"
          whileTap={{ scale: 0.9 }}
        >
          <button className="p-2 rounded-full bg-primary/10 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;

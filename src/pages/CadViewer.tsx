import { useState } from 'react';
import { motion } from 'framer-motion';
import CadModelViewer from '../components/3d/CadModelViewer';
import PixelReveal from '../components/3d/PixelReveal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, FileCode } from 'lucide-react';
import { toast } from 'sonner';

const CadViewer = () => {
  const [activeTab, setActiveTab] = useState('design');
  
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  const componentData = [
    { 
      id: 'main-board', 
      name: 'Main Controller Board', 
      description: 'Central processing unit featuring an ARM Cortex-M4 microcontroller running at 120MHz with integrated mesh networking capabilities.',
      specs: [
        'STM32F4 Processor',
        '512KB Flash Memory',
        '128KB RAM',
        'Multiple communication interfaces'
      ]
    },
    { 
      id: 'radio-module', 
      name: 'Radio Module', 
      description: 'Long-range 915MHz LoRa transceiver for mesh network communications with up to 10km range per node.',
      specs: [
        'SX1276 LoRa Chipset',
        '20dBm TX Power',
        '-148dBm Sensitivity',
        'Configurable spreading factors'
      ]
    },
    { 
      id: 'sensor-array', 
      name: 'Environmental Sensor Array', 
      description: 'Comprehensive sensor suite for atmospheric measurements during flight.',
      specs: [
        'BME680 Temperature/Humidity/Pressure',
        'UV Index Sensor',
        'Radiation Detector',
        'GPS Module'
      ]
    }
  ];
  
  const [selectedComponent, setSelectedComponent] = useState(componentData[0]);
  
  const handleDownload = (fileType: string) => {
    // This would typically download actual files in a real app
    toast.success(`${fileType} download started`);
    
    // For demo purposes only - simulates a download click but won't actually download anything
    setTimeout(() => {
      toast.success(`${fileType} downloaded successfully`);
    }, 2000);
  };
  
  return (
    <motion.div
      className="pt-20"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="w-full md:w-1/3">
            <motion.h1 
              className="text-3xl font-bold mb-4 gradient-text"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              SkyCell CAD Explorer
            </motion.h1>
            
            <motion.p 
              className="text-muted-foreground mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Explore the detailed 3D models of our SkyCell hardware. Interact with the model to see different components and their specifications.
            </motion.p>
            
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Tabs defaultValue="design" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="specs">Specs</TabsTrigger>
                </TabsList>
                <TabsContent value="design" className="mt-4">
                  <div className="bg-card/50 backdrop-blur-sm p-4 rounded-md border border-border/50">
                    <h3 className="font-medium mb-2">Design Philosophy</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our design focuses on lightweight durability, modular construction, and energy efficiency to maximize flight time and functionality.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-accent p-3 rounded-md">
                        <p className="text-xs font-medium">Total Weight</p>
                        <p className="text-lg font-bold">300g</p>
                      </div>
                      <div className="bg-accent p-3 rounded-md">
                        <p className="text-xs font-medium">Dimensions</p>
                        <p className="text-lg font-bold">18x18x18cm</p>
                      </div>
                      <div className="bg-accent p-3 rounded-md">
                        <p className="text-xs font-medium">Power Draw</p>
                        <p className="text-lg font-bold">TBD</p>
                      </div>
                      <div className="bg-accent p-3 rounded-md">
                        <p className="text-xs font-medium">Battery Life</p>
                        <p className="text-lg font-bold">TBD</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleDownload('CAD Model')}
                      >
                        <Download size={16} className="mr-1" /> Download CAD Model
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="components" className="mt-4">
                  <div className="bg-card/50 backdrop-blur-sm p-4 rounded-md border border-border/50">
                    <h3 className="font-medium mb-3">Major Components</h3>
                    <div className="space-y-3">
                      {componentData.map(component => (
                        <div 
                          key={component.id}
                          className={`p-3 rounded-md cursor-pointer transition-all ${selectedComponent.id === component.id ? 'bg-primary text-white' : 'bg-accent hover:bg-accent/70'}`}
                          onClick={() => setSelectedComponent(component)}
                        >
                          <p className="font-medium">{component.name}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium">{selectedComponent.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{selectedComponent.description}</p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-border">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDownload('Bill of Materials (BOM)')}
                      >
                        <FileCode size={16} className="mr-1" /> Download BOM
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="specs" className="mt-4">
                  <div className="bg-card/50 backdrop-blur-sm p-4 rounded-md border border-border/50">
                    <h3 className="font-medium mb-2">{selectedComponent.name} Specs</h3>
                    <ul className="space-y-2 mt-3">
                      {selectedComponent.specs.map((spec, index) => (
                        <li key={index} className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                          <span className="text-sm">{spec}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-3 border-t border-border">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleDownload('Datasheet')}
                      >
                        <FileText size={16} className="mr-1" /> Download Datasheet
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
          
          <div className="w-full md:w-2/3 mt-10 md:mt-0 bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden">
            <CadModelViewer />
          </div>
        </div>
        
        <motion.div 
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50">
            <h3 className="text-lg font-bold mb-3">Material Selection</h3>
            <p className="text-sm text-muted-foreground">
              TBD
            </p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50">
            <h3 className="text-lg font-bold mb-3">Environmental Testing</h3>
            <p className="text-sm text-muted-foreground">
              TBD
            </p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50">
            <h3 className="text-lg font-bold mb-3">Optimization Process</h3>
            <p className="text-sm text-muted-foreground">
              TBD
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CadViewer;


import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart as LucideLineChart } from 'lucide-react';

// Import Card components that were missing
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import our new components
import DataCard from '@/components/dashboard/DataCard';
import TelemetryGraphs from '@/components/dashboard/TelemetryGraphs';
import LiveCamera from '@/components/dashboard/LiveCamera';
import TrajectoryVisualization from '@/components/dashboard/TrajectoryVisualization';
import SystemStatus from '@/components/dashboard/SystemStatus';
import StatusIndicator from '@/components/dashboard/StatusIndicator';

// Import utilities
import { generateMockData, type TelemetryData } from '@/utils/mockTelemetryUtils';

const Dashboard = () => {
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    main: 'online' as const,
    radio: 'online' as const,
    sensors: 'online' as const,
    gps: 'online' as const
  });
  
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };
  
  // Simulate real-time data updates
  useEffect(() => {
    setTelemetryData(generateMockData());
    
    if (isLive) {
      const interval = setInterval(() => {
        setTelemetryData(generateMockData());
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isLive]);
  
  const lastReading = telemetryData.length > 0 ? telemetryData[telemetryData.length - 1] : {
    altitude: 0,
    temperature: 0,
    pressure: 0,
    batteryVoltage: '0',
    signalStrength: 0,
    dataRate: 0
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
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">SkyCell Live Dashboard</h1>
            <p className="text-muted-foreground">Monitor real-time telemetry and system status</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <StatusIndicator status={isLive ? "online" : "standby"} />
            <button 
              className={`px-3 py-1 rounded-md text-sm ${isLive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Live Data' : 'Paused'}
            </button>
            <span className="text-sm text-muted-foreground">Last update: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        
        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <DataCard 
            title="Altitude" 
            value={lastReading.altitude.toLocaleString()} 
            unit="m"
            icon={<LucideLineChart />}
          />
          <DataCard 
            title="Temperature" 
            value={lastReading.temperature} 
            unit="°C"
            icon={<LucideLineChart />}
          />
          <DataCard 
            title="Pressure" 
            value={lastReading.pressure} 
            unit="kPa"
            icon={<LucideLineChart />}
          />
          <DataCard 
            title="Battery" 
            value={lastReading.batteryVoltage} 
            unit="V"
            icon={<LucideLineChart />}
            status={Number(lastReading.batteryVoltage) > 3.6 ? "online" : "warning"}
          />
          <DataCard 
            title="Signal" 
            value={lastReading.signalStrength} 
            unit="%"
            icon={<LucideLineChart />}
            status={lastReading.signalStrength > 60 ? "online" : "warning"}
          />
          <DataCard 
            title="Data Rate" 
            value={lastReading.dataRate} 
            unit="kb/s"
            icon={<LucideLineChart />}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content column */}
          <div className="md:col-span-2 space-y-6">
            {/* Telemetry graphs */}
            <TelemetryGraphs telemetryData={telemetryData} />
            
            {/* Camera feed */}
            <LiveCamera />
          </div>
          
          {/* Sidebar column */}
          <div className="space-y-6">
            {/* 3D position visualization - Fixed component */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>3D Position</CardTitle>
              </CardHeader>
              <CardContent>
                <TrajectoryVisualization />
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Latitude</div>
                    <div className="text-sm font-medium">34.052°N</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Longitude</div>
                    <div className="text-sm font-medium">118.243°W</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Speed</div>
                    <div className="text-sm font-medium">43 km/h</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* System status */}
            <SystemStatus systemStatus={systemStatus} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

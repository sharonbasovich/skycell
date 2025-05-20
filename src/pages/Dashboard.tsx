
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart as LucideLineChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';

// Mock telemetry data
const generateMockData = () => {
  let data = [];
  const now = new Date();
  
  for (let i = 15; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const timeString = time.toTimeString().split(' ')[0].substring(0, 5);
    
    data.push({
      time: timeString,
      altitude: Math.round(28000 + Math.sin(i / 3) * 1500 + Math.random() * 500),
      temperature: Math.round(-50 + Math.sin(i / 2) * 8 + Math.random() * 3),
      pressure: Math.round(10 + Math.sin(i / 4) * 3 + Math.random() * 1),
      batteryVoltage: (3.7 + Math.sin(i / 10) * 0.15 + Math.random() * 0.05).toFixed(2),
      signalStrength: Math.round(75 + Math.sin(i / 3) * 15 + Math.random() * 5),
      dataRate: Math.round(240 + Math.sin(i / 2) * 50 + Math.random() * 20),
    });
  }
  
  return data;
};

const BalloonPosition = () => {
  return (
    <group>
      {/* Balloon */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      
      {/* Payload */}
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshStandardMaterial color="#8B5CF6" />
      </mesh>
      
      {/* Connection line */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, -0.1, 0, 0, -0.6, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#FFFFFF" />
      </lineSegments>
      
      {/* Position light */}
      <pointLight position={[0, 0, 0]} intensity={1} distance={5} color="#FFFFFF" />
    </group>
  );
};

const Earth = () => {
  return (
    <mesh position={[0, -100, 0]} rotation={[0.2, 0, 0]}>
      <sphereGeometry args={[100, 64, 64]} />
      <meshStandardMaterial 
        color="#1E3A8A" 
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  );
};

// Fixed TrajectoryPath component
const TrajectoryPath = () => {
  // Create a curved path representing the balloon's trajectory
  const points = [];
  const curveSegments = 100;
  
  for (let i = 0; i < curveSegments; i++) {
    const t = i / (curveSegments - 1);
    // Simple spiral path calculation
    points.push(
      Math.sin(t * Math.PI * 2) * 20,
      t * 15,
      Math.cos(t * Math.PI * 2) * 20
    );
  }
  
  // Create a properly formatted array for the buffer attribute
  const pointsArray = new Float32Array(points);
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={curveSegments}
          array={pointsArray}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#0EA5E9" opacity={0.7} transparent />
    </line>
  );
};

const StatusIndicator = ({ status }) => {
  const colors = {
    online: "bg-green-500",
    warning: "bg-amber-500",
    offline: "bg-red-500",
    standby: "bg-blue-500"
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full ${colors[status]} animate-pulse`}></div>
      <span className="text-sm font-medium capitalize">{status}</span>
    </div>
  );
};

const DataCard = ({ title, value, unit, icon, status = null }) => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-primary h-4 w-4">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value} <span className="text-muted-foreground text-sm">{unit}</span></div>
        {status && <StatusIndicator status={status} />}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [telemetryData, setTelemetryData] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    main: 'online',
    radio: 'online',
    sensors: 'online',
    gps: 'online'
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
    batteryVoltage: 0,
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
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Telemetry Data</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="altitude">
                  <TabsList className="mb-4">
                    <TabsTrigger value="altitude">Altitude</TabsTrigger>
                    <TabsTrigger value="temperature">Temperature</TabsTrigger>
                    <TabsTrigger value="signal">Signal</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="altitude">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={telemetryData}>
                          <defs>
                            <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis domain={['dataMin - 500', 'dataMax + 500']} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.8)',
                              borderColor: 'rgba(100, 116, 139, 0.5)',
                              borderRadius: '0.375rem',
                            }} 
                          />
                          <Area type="monotone" dataKey="altitude" stroke="#0EA5E9" fillOpacity={1} fill="url(#colorAlt)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="temperature">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={telemetryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.8)',
                              borderColor: 'rgba(100, 116, 139, 0.5)',
                              borderRadius: '0.375rem',
                            }}
                          />
                          <Line type="monotone" dataKey="temperature" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="signal">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={telemetryData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(15, 23, 42, 0.8)',
                              borderColor: 'rgba(100, 116, 139, 0.5)',
                              borderRadius: '0.375rem',
                            }}
                          />
                          <Bar dataKey="signalStrength" fill="#0EA5E9" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Camera feed */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>Live Camera Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-skycell-dark rounded-lg flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-skycell-blue/20 to-skycell-purple/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Connecting to camera feed...</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span>Resolution: 1280x720</span>
                  <span>FPS: 15</span>
                  <span>Latency: 1.2s</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar column */}
          <div className="space-y-6">
            {/* 3D position visualization - Fixed component */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>3D Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] bg-skycell-dark rounded-lg overflow-hidden">
                  <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                    <ambientLight intensity={0.2} />
                    <pointLight position={[10, 10, 10]} />
                    <BalloonPosition />
                    <Earth />
                    <TrajectoryPath />
                    <Stars radius={100} depth={50} count={1000} factor={2} />
                    <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                  </Canvas>
                </div>
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
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Main Controller</span>
                    <StatusIndicator status={systemStatus.main} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Radio Module</span>
                    <StatusIndicator status={systemStatus.radio} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Sensor Array</span>
                    <StatusIndicator status={systemStatus.sensors} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span>GPS Module</span>
                    <StatusIndicator status={systemStatus.gps} />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">System Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime</span>
                      <span>3h 24m 12s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CPU Usage</span>
                      <span>23%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Memory</span>
                      <span>64MB / 256MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storage</span>
                      <span>1.2GB / 8GB</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-2 rounded-md text-sm transition-colors">
                    Download Full Diagnostics
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;

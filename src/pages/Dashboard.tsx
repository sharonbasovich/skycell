import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart as LucideLineChart } from "lucide-react";

// Import Card components that were missing
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import our new components
import DataCard from "@/components/dashboard/DataCard";
import TelemetryGraphs from "@/components/dashboard/TelemetryGraphs";
import LiveCamera from "@/components/dashboard/LiveCamera";
import TrajectoryVisualization from "@/components/dashboard/TrajectoryVisualization";
import SystemStatus from "@/components/dashboard/SystemStatus";
import StatusIndicator from "@/components/dashboard/StatusIndicator";

// Import utilities
import { type TelemetryData } from "@/utils/mockTelemetryUtils";

const Dashboard = () => {
  const [telemetryData, setTelemetryData] = useState<TelemetryData[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    main: "online" as const,
    radio: "online" as const,
    sensors: "online" as const,
    gps: "online" as const,
  });

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/logging.json");
        const data = await response.json();

        const formattedData = data.map((d: any, index: number) => ({
          index: index,
          altitude: d.altitude,
          temperature: d.cpu_temp,
          pressure: 10, // Mock data
          batteryVoltage: d.battery_voltage.toFixed(2),
          signalStrength: d.rssi,
          dataRate: 250, // Mock data
          latitude: d.latitude,
          longitude: d.longitude,
        }));

        setTelemetryData(formattedData);
      } catch (error) {
        console.error("Failed to fetch telemetry data:", error);
      }
    };

    fetchData();

    if (isLive) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [isLive]);

  const lastReading =
    telemetryData.length > 0
      ? telemetryData[telemetryData.length - 1]
      : {
          altitude: 0,
          temperature: 0,
          pressure: 0,
          batteryVoltage: "0",
          signalStrength: 0,
          dataRate: 0,
          latitude: 0,
          longitude: 0,
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
            <h1 className="text-3xl font-bold gradient-text">
              SkyCell Telemetry Results
            </h1>
            <p className="text-muted-foreground">
              Apart from connecting to the node from the ground, we collected
              some data
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <StatusIndicator status="launched" />
            <span className="text-sm text-muted-foreground">
              06/21/2025
            </span>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <DataCard
            title="Average CPU Temperature"
            value={lastReading.temperature}
            unit="°C"
            icon={<LucideLineChart />}
          />
          <DataCard
            title="Average Battery"
            value={lastReading.batteryVoltage}
            unit="V"
            icon={<LucideLineChart />}
          />
          <DataCard
            title="Average Recieved Signal Strength"
            value={lastReading.signalStrength}
            unit="%"
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
                    <div className="text-xs text-muted-foreground">
                      Latitude
                    </div>
                    <div className="text-sm font-medium">
                      {lastReading.latitude.toFixed(3)}°N
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">
                      Longitude
                    </div>
                    <div className="text-sm font-medium">
                      {lastReading.longitude.toFixed(3)}°W
                    </div>
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

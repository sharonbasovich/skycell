import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
} from "recharts";

interface TelemetryData {
  altitude: number;
  temperature: number;
  pressure: number;
  batteryVoltage: string;
  signalStrength: number;
  dataRate: number;
  latitude: number;
  longitude: number;
}

interface AltitudeData {
  time: string;
  altitude: number;
  index: number;
}

interface TelemetryGraphsProps {
  telemetryData: TelemetryData[];
}

const TelemetryGraphs: React.FC<TelemetryGraphsProps> = ({ telemetryData }) => {
  const [csvData, setCsvData] = useState<AltitudeData[]>([]);

  useEffect(() => {
    const fetchCsvData = async () => {
      try {
        const response = await fetch("/altitude.csv");
        const csvText = await response.text();

        // Parse CSV data
        const lines = csvText.split("\n").slice(1); // Skip header
        const parsedData = lines
          .filter((line) => line.trim())
          .map((line, index) => {
            const [time, altitude] = line.split(",");
            return {
              time: time.replace(/"/g, ""),
              altitude: parseInt(altitude),
              index: index,
            };
          });

        setCsvData(parsedData);
      } catch (error) {
        console.error("Failed to fetch CSV data:", error);
      }
    };

    fetchCsvData();
  }, []);

  // Create combined data with packet points positioned at appropriate indices
  const combinedData = csvData.map((point, index) => {
    return {
      ...point,
      packetAltitude: null,
    };
  });

  // Add packet data at the beginning of the timeline
  const packetData = telemetryData.map((packet, index) => ({
    index: index,
    packetAltitude: packet.altitude * 0.3048, // Convert feet to meters
    time: `Packet ${index + 1}`,
    altitude: null,
  }));

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle>Altitude Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={combinedData}
              margin={{ top: 20, right: 30, left: 60, bottom: 40 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
              />
              <XAxis dataKey="index" hide={true} />
              <YAxis domain={[0, 15000]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  borderColor: "rgba(100, 116, 139, 0.5)",
                  borderRadius: "0.375rem",
                }}
                labelFormatter={(value, payload) => {
                  if (payload && payload.length > 0) {
                    const dataPoint = payload[0].payload;
                    return dataPoint.time || `Time Index: ${value}`;
                  }
                  return `Time Index: ${value}`;
                }}
                formatter={(value, name) => [
                  value,
                  name === "altitude" ? "Actual Altitude" : "Altitude",
                ]}
              />

              {/* Background line showing actual altitude data */}
              <Line
                type="monotone"
                dataKey="altitude"
                stroke="#0EA5E9"
                strokeWidth={2}
                dot={false}
                name="Actual Altitude"
              />

              {/* Overlay packet data as scatter points */}
              <Scatter
                data={packetData}
                dataKey="packetAltitude"
                fill="#F59E0B"
                stroke="#F59E0B"
                strokeWidth={2}
                r={6}
                name="Packet Data"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Altitude label positioned at center-left */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 origin-left text-sm text-muted-foreground">
            Altitude (m)
          </div>

          {/* Time Index label positioned at bottom center */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground">
            Time
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TelemetryGraphs;

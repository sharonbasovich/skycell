
export interface TelemetryData {
  time: string;
  altitude: number;
  temperature: number;
  pressure: number;
  batteryVoltage: string;
  signalStrength: number;
  dataRate: number;
}

// Mock telemetry data generator
export const generateMockData = (): TelemetryData[] => {
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

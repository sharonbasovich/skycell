
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TelemetryData {
  time: string;
  altitude: number;
  temperature: number;
  pressure: number;
  batteryVoltage: string;
  signalStrength: number;
  dataRate: number;
}

interface TelemetryGraphsProps {
  telemetryData: TelemetryData[];
}

const TelemetryGraphs: React.FC<TelemetryGraphsProps> = ({ telemetryData }) => {
  return (
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
  );
};

export default TelemetryGraphs;

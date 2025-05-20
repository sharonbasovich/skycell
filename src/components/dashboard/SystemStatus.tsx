
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatusIndicator from './StatusIndicator';

type StatusType = 'online' | 'warning' | 'offline' | 'standby';

interface SystemStatusProps {
  systemStatus: {
    main: StatusType;
    radio: StatusType;
    sensors: StatusType;
    gps: StatusType;
  };
}

const SystemStatus: React.FC<SystemStatusProps> = ({ systemStatus }) => {
  return (
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
  );
};

export default SystemStatus;

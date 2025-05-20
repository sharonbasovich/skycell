
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatusIndicator from './StatusIndicator';

type StatusType = 'online' | 'warning' | 'offline' | 'standby' | null;

interface DataCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  status?: StatusType;
}

const DataCard: React.FC<DataCardProps> = ({ title, value, unit, icon, status = null }) => {
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

export default DataCard;


import React from 'react';

type StatusType = 'online' | 'warning' | 'offline' | 'standby';

interface StatusIndicatorProps {
  status: StatusType;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
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

export default StatusIndicator;

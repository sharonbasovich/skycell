
import React from 'react';

type StatusType = 'launched' | 'warning' | 'offline' | 'standby';

interface StatusIndicatorProps {
  status: StatusType;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const colors = {
    launched: "bg-green-500",
    warning: "bg-amber-500",
    offline: "bg-red-500",
    standby: "bg-blue-500"
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full ${colors[status]} animate-pulse`}></div>
      <span className="text-sm font-medium capitalize">Launched!</span>
    </div>
  );
};

export default StatusIndicator;


import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const LiveCamera: React.FC = () => {
  return (
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
  );
};

export default LiveCamera;

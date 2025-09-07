import React, { useState, useEffect } from 'react';
import { Wifi, Globe, Shield, Activity } from 'lucide-react';

const NetworkPanel = ({ sendMessage }) => {
  const [networkData, setNetworkData] = useState({
    status: 'Connected',
    ip: '192.168.1.100',
    download: 0,
    upload: 0,
    ping: 12,
    connections: []
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkData(prev => ({
        ...prev,
        download: Math.random() * 10,
        upload: Math.random() * 5,
        ping: 10 + Math.random() * 20
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNetworkScan = () => {
    if (sendMessage) {
      sendMessage({
        type: 'get_network'
      });
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-4 text-neon-cyan">
        <Wifi size={16} />
        <span className="text-sm font-mono">NETWORK PANEL</span>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs">Status:</span>
          <span className="text-xs text-neon-green">{networkData.status}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">IP Address:</span>
          <span className="text-xs">{networkData.ip}</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Download:</span>
            <span>{networkData.download.toFixed(1)} MB/s</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Upload:</span>
            <span>{networkData.upload.toFixed(1)} MB/s</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Ping:</span>
            <span>{networkData.ping.toFixed(0)}ms</span>
          </div>
        </div>
        
        <button
          onClick={handleNetworkScan}
          className="w-full px-3 py-2 text-xs bg-neon-cyan/20 text-neon-cyan rounded hover:bg-neon-cyan/30 transition-all duration-300 border border-neon-cyan/30"
        >
          <Activity size={12} className="inline mr-2" />
          NETWORK SCAN
        </button>
        
        <div className="mt-4 p-3 bg-black/30 rounded border border-neon-cyan/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} />
            <span className="text-xs">Security Status</span>
          </div>
          <div className="text-xs text-neon-green">VPN: Active</div>
          <div className="text-xs text-neon-green">Firewall: Enabled</div>
          <div className="text-xs text-neon-green">Encryption: AES-256</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkPanel;
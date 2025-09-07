import React, { useState, useEffect, useRef } from 'react';
import { Activity, Cpu, HardDrive, Thermometer, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SystemMonitor = ({ sendMessage }) => {
  const { state } = useApp();
  const [stats, setStats] = useState({
    cpu: 45,
    memory: 62,
    disk: 78,
    temperature: 65,
    power: 85
  });
  const [cpuHistory, setCpuHistory] = useState(Array(20).fill(0));
  const canvasRef = useRef(null);

  // Update stats from backend data
  useEffect(() => {
    if (state.systemStats) {
      setStats(prev => ({
        ...prev,
        cpu: state.systemStats.cpu || prev.cpu,
        memory: state.systemStats.memory || prev.memory,
        disk: state.systemStats.disk || prev.disk
      }));
      
      // Update CPU history
      setCpuHistory(prev => [...prev.slice(1), state.systemStats.cpu || 0]);
    }
  }, [state.systemStats]);

  // Fallback random data if no backend
  useEffect(() => {
    const interval = setInterval(() => {
      if (!state.systemStats || Object.keys(state.systemStats).length === 0) {
        const newStats = {
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
          disk: Math.floor(Math.random() * 100),
          temperature: 45 + Math.floor(Math.random() * 30),
          power: 70 + Math.floor(Math.random() * 30)
        };
        setStats(newStats);
        setCpuHistory(prev => [...prev.slice(1), newStats.cpu]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [state.systemStats]);

  // Draw CPU graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = (height / 10) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw CPU line
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    cpuHistory.forEach((value, index) => {
      const x = (width / (cpuHistory.length - 1)) * index;
      const y = height - (height * value / 100);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.stroke();
  }, [cpuHistory]);

  const StatBar = ({ label, value, icon: Icon, color = 'neon-cyan', unit = '%' }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={14} className={`text-${color}`} />
          <span className="text-xs font-mono">{label}</span>
        </div>
        <span className="text-xs font-mono">{value}{unit}</span>
      </div>
      <div className="relative">
        <div className="w-full bg-gray-800/50 rounded-full h-2">
          <div
            className={`bg-gradient-to-r from-${color} to-${color} h-2 rounded-full transition-all duration-500 shadow-neon`}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
        <div
          className={`absolute top-0 h-2 bg-${color} rounded-full opacity-50 animate-pulse`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );

  const getTemperatureColor = (temp) => {
    if (temp > 80) return 'red-400';
    if (temp > 70) return 'yellow-400';
    return 'neon-green';
  };

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-4 text-neon-cyan">
        <Activity size={16} />
        <span className="text-sm font-mono">SYSTEM MONITOR</span>
        <div className="ml-auto flex gap-1">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>
      
      <div className="space-y-3">
        <StatBar label="CPU" value={stats.cpu} icon={Cpu} color="neon-cyan" />
        <StatBar label="MEMORY" value={stats.memory} icon={HardDrive} color="neon-blue" />
        <StatBar label="DISK" value={stats.disk} icon={HardDrive} color="neon-green" />
        <StatBar 
          label="TEMP" 
          value={stats.temperature} 
          icon={Thermometer} 
          color={getTemperatureColor(stats.temperature)}
          unit="°C"
        />
        
        {/* CPU Graph */}
        <div className="mt-4 p-3 bg-black/30 rounded border border-neon-cyan/30">
          <div className="text-xs mb-2 text-neon-cyan font-mono">CPU USAGE GRAPH</div>
          <canvas
            ref={canvasRef}
            width={300}
            height={80}
            className="w-full h-20 rounded"
          />
        </div>
        
        {/* System Info */}
        <div className="mt-4 p-3 bg-black/30 rounded border border-neon-cyan/30">
          <div className="text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime:</span>
              <span className="text-neon-green">
                {state.systemStats?.timestamp ? 
                  new Date(state.systemStats.timestamp).toLocaleTimeString() : 
                  '2h 34m 12s'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Processes:</span>
              <span className="text-neon-cyan">247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network:</span>
              <span className="text-neon-blue">
                {state.systemStats?.network ? 
                  `${(state.systemStats.network.bytes_recv / 1024 / 1024).toFixed(1)} MB` : 
                  '1.2 MB/s'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
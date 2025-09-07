import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useWebSocket } from '../hooks/useWebSocket';
import DevModeToggle from './DevModeToggle';
import HoloFace from './HoloFace';
import DraggableWidget from './DraggableWidget';
import Terminal from './Terminal';
import SystemMonitor from './SystemMonitor';
import Launcher from './Launcher';
import NetworkPanel from './NetworkPanel';
import NotificationPanel from './NotificationPanel';

const JarvisDesktop = () => {
  const { state, dispatch } = useApp();
  const { lastMessage, sendMessage, readyState } = useWebSocket('ws://localhost:8000/ws');

  const [widgets, setWidgets] = useState([
    {
      id: 'terminal',
      component: Terminal,
      position: { x: 50, y: 50 },
      size: { width: 600, height: 400 },
      visible: true
    },
    {
      id: 'system-monitor',
      component: SystemMonitor,
      position: { x: 700, y: 50 },
      size: { width: 400, height: 300 },
      visible: true
    },
    {
      id: 'launcher',
      component: Launcher,
      position: { x: 50, y: 500 },
      size: { width: 300, height: 200 },
      visible: true
    },
    {
      id: 'network',
      component: NetworkPanel,
      position: { x: 1200, y: 300 },
      size: { width: 350, height: 250 },
      visible: true
    }
  ]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'system_stats':
          dispatch({
            type: 'UPDATE_SYSTEM_STATS',
            payload: lastMessage.data
          });
          break;
        case 'notification':
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: Date.now(),
              ...lastMessage.data
            }
          });
          break;
        case 'jarvis_status':
          dispatch({
            type: 'UPDATE_JARVIS_STATUS',
            payload: lastMessage.data
          });
          break;
        case 'command_response':
          // Handle command responses
          console.log('Command response:', lastMessage.data);
          break;
        default:
          console.log('Unknown message type:', lastMessage.type);
      }
    }
  }, [lastMessage, dispatch]);

  const updateWidgetPosition = (id, position) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, position } : widget
    ));
  };

  return (
    <div className="w-screen h-screen bg-dark-bg relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          className="w-full h-full"
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }} 
        />
      </div>

      {/* Connection Status Indicator */}
      <div className="absolute top-4 left-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg glass-panel text-xs ${
          readyState === 1 ? 'text-neon-green' : 'text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            readyState === 1 ? 'bg-neon-green animate-pulse' : 'bg-red-400'
          }`} />
          {readyState === 1 ? 'QUANTUM LINK ACTIVE' : 'CONNECTION LOST'}
        </div>
      </div>

      {/* Dev Mode Toggle */}
      <DevModeToggle />

      {/* Central Jarvis Face */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <HoloFace sendMessage={sendMessage} />
      </div>

      {/* Draggable Widgets */}
      <AnimatePresence>
        {widgets.filter(widget => widget.visible).map(widget => (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            position={widget.position}
            size={widget.size}
            devMode={state.devMode}
            onPositionChange={updateWidgetPosition}
          >
            <widget.component sendMessage={sendMessage} />
          </DraggableWidget>
        ))}
      </AnimatePresence>

      {/* Notification Panel */}
      <NotificationPanel />

      {/* Ambient Glow Effects */}
      <motion.div 
        className="absolute top-10 left-10 w-32 h-32 bg-neon-cyan rounded-full opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div 
        className="absolute bottom-10 right-10 w-40 h-40 bg-neon-blue rounded-full opacity-15 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
      />

      {/* Scanning Lines Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.03) 50%, transparent 100%)',
          width: '200%',
        }}
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
};

export default JarvisDesktop;
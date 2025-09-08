import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

const SystemLogsWidget = () => {
  const { state } = useApp();
  const [logs, setLogs] = useState([]);
  const logsEndRef = useRef(null);

  // For demo, simulate logs from notifications of type 'log'
  useEffect(() => {
    const logNotifications = state.notifications.filter(n => n.type === 'log');
    setLogs(logNotifications.map(n => `[${new Date(n.timestamp).toLocaleTimeString()}] ${n.message}`));
  }, [state.notifications]);

  // Auto scroll to bottom on new logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="h-full p-2 bg-black/20 rounded-md overflow-y-auto font-mono text-xs text-neon-cyan">
      {logs.length === 0 && <div className="text-gray-600 italic">No logs yet...</div>}
      {logs.map((log, idx) => (
        <div key={idx} className="whitespace-pre-wrap">{log}</div>
      ))}
      <div ref={logsEndRef} />
    </div>
  );
};

export default SystemLogsWidget;
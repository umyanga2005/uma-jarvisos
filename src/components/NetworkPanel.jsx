import React, { useEffect, useState } from 'react';

const NetworkPanel = () => {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    // Fetch network connections every 5 seconds
    const fetchConnections = async () => {
      try {
        const res = await fetch('/api/network');
        const data = await res.json();
        setConnections(data.connections || []);
      } catch (e) {
        console.error('Failed to fetch network connections', e);
      }
    };

    fetchConnections();
    const interval = setInterval(fetchConnections, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full p-2 overflow-auto text-neon-cyan font-mono text-xs">
      <h3 className="mb-2 font-bold">Network Connections</h3>
      {connections.length === 0 && <div>No active connections</div>}
      <ul>
        {connections.map((conn, idx) => (
          <li key={idx} className="mb-1">
            <span className="font-semibold">{conn.local_address}</span> → <span>{conn.remote_address}</span> [{conn.status}]
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NetworkPanel;
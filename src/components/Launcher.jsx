import React, { useState, useEffect } from 'react';
import {
  Grid3X3,
  Search,
  Settings,
  Terminal as TerminalIcon,
  Shield,
  Globe,
  Code,
  Database,
  Wifi,
  Lock,
  Eye,
  Zap,
  X, // For closing the app frame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder for a custom app frame
const CustomAppFrame = ({ app, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="glass-panel neon-border rounded-lg overflow-hidden flex flex-col" style={{ width: '80%', height: '80%' }}>
        <div className="flex items-center justify-between p-3 bg-black/50 border-b border-neon-cyan/30">
          <div className="flex items-center gap-2 text-neon-cyan">
            <app.icon size={16} />
            <span className="text-sm font-mono">{app.name}</span>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 p-4 text-neon-cyan overflow-auto">
          {/* This is where the actual application content would go */}
          {/* For a real app, this might be an iframe for web apps, or a more complex integration */}
          <p className="text-center text-gray-400 mt-10">
            Launching <span className="text-neon-green">{app.name}</span>...
          </p>
          <p className="text-center text-xs text-gray-500 mt-2">
            (In a full system, this would display the actual application content or an embedded view.)
          </p>
          {/* Example: If it's a web-based terminal, you might embed it here */}
          {app.name === 'Terminal' && (
            <div className="mt-4 p-4 bg-black/20 rounded-md border border-neon-cyan/20">
              <p className="text-xs text-neon-green">Simulating embedded terminal...</p>
              <pre className="text-xs text-gray-300 mt-2">
                $ ls -l /usr/bin <br/>
                total 12345 <br/>
                -rwxr-xr-x 1 root root 123456 Jan 1 2023 bash <br/>
                -rwxr-xr-x 1 root root 789012 Feb 1 2023 python3 <br/>
                ...
              </pre>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};


const Launcher = ({ sendMessage }) => { // Accept sendMessage prop
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [installedApps, setInstalledApps] = useState([]); // State for dynamically loaded apps
  const [activeApp, setActiveApp] = useState(null); // State for app opened in custom frame

  const categories = [
    { id: 'all', name: 'All', icon: Grid3X3 },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'network', name: 'Network', icon: Wifi },
    { id: 'system', name: 'System', icon: Settings }
  ];

  // Simulate fetching installed apps from backend
  useEffect(() => {
    const fetchApps = async () => {
      // In a real scenario, you'd make a WebSocket or REST call to your backend
      // sendMessage({ type: 'get_installed_apps' });
      // For now, simulate with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInstalledApps([
        { name: 'Terminal', icon: TerminalIcon, color: 'text-neon-cyan', category: 'system', executable: 'xterm' },
        { name: 'Nmap Scanner', icon: Globe, color: 'text-neon-green', category: 'network', executable: 'nmap' },
        { name: 'Metasploit', icon: Shield, color: 'text-red-400', category: 'security', executable: 'msfconsole' },
        { name: 'Wireshark', icon: Eye, color: 'text-blue-400', category: 'network', executable: 'wireshark' },
        { name: 'Burp Suite', icon: Lock, color: 'text-orange-400', category: 'security', executable: 'burpsuite' },
        { name: 'SQLMap', icon: Database, color: 'text-purple-400', category: 'security', executable: 'sqlmap' },
        { name: 'Aircrack-ng', icon: Wifi, color: 'text-yellow-400', category: 'network', executable: 'aircrack-ng' },
        { name: 'John the Ripper', icon: Zap, color: 'text-red-500', category: 'security', executable: 'john' },
        { name: 'Hydra', icon: Code, color: 'text-green-400', category: 'security', executable: 'hydra' },
        { name: 'VS Code', icon: Code, color: 'text-blue-500', category: 'system', executable: 'code' },
        { name: 'Firefox', icon: Globe, color: 'text-orange-500', category: 'system', executable: 'firefox' },
      ]);
    };
    fetchApps();
  }, []);

  const filteredApps = installedApps.filter(app => {
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAppClick = (app) => {
    // In a real system, you'd send a command to the backend to launch the app
    // For now, we'll simulate opening it in a custom frame.
    console.log(`Attempting to launch: ${app.name} (executable: ${app.executable})`);
    setActiveApp(app); // Set the app to be displayed in the custom frame

    // If you wanted to launch it natively via backend:
    // if (sendMessage) {
    //   sendMessage({
    //     type: 'launch_application',
    //     data: { executable: app.executable }
    //   });
    // }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-neon-cyan">
        <Grid3X3 size={16} />
        <span className="text-sm font-mono">APPLICATION LAUNCHER</span>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search applications..."
          className="w-full pl-10 pr-4 py-2 bg-black/30 border border-neon-cyan/30 rounded-lg text-xs text-neon-cyan placeholder-neon-cyan/50 outline-none focus:border-neon-cyan/60"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs transition-all duration-300 whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                : 'bg-black/20 text-gray-400 border border-gray-600/30 hover:border-neon-cyan/30'
            }`}
          >
            <category.icon size={12} />
            {category.name}
          </button>
        ))}
      </div>

      {/* Apps Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neon-cyan/30">
        <div className="grid grid-cols-3 gap-3">
          {filteredApps.map((app, index) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }} // Reduced delay for faster appearance
              className="flex flex-col items-center p-3 rounded-lg bg-black/30 border border-neon-cyan/30 hover:border-neon-cyan/60 cursor-pointer transition-all duration-300 hover:shadow-neon group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAppClick(app)}
            >
              <app.icon size={24} className={`${app.color} group-hover:animate-pulse`} />
              <span className="text-xs mt-2 text-center leading-tight">{app.name}</span>
            </motion.div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center text-gray-400 text-xs mt-8">
            No applications found
          </div>
        )}
      </div>

      {/* Custom App Frame */}
      <AnimatePresence>
        {activeApp && (
          <CustomAppFrame app={activeApp} onClose={() => setActiveApp(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Launcher;
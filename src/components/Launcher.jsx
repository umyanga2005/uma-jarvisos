import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const Launcher = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All', icon: Grid3X3 },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'network', name: 'Network', icon: Wifi },
    { id: 'system', name: 'System', icon: Settings }
  ];

  const apps = [
    { name: 'Terminal', icon: TerminalIcon, color: 'text-neon-cyan', category: 'system' },
    { name: 'Nmap Scanner', icon: Globe, color: 'text-neon-green', category: 'network' },
    { name: 'Metasploit', icon: Shield, color: 'text-red-400', category: 'security' },
    { name: 'Wireshark', icon: Eye, color: 'text-blue-400', category: 'network' },
    { name: 'Burp Suite', icon: Lock, color: 'text-orange-400', category: 'security' },
    { name: 'SQLMap', icon: Database, color: 'text-purple-400', category: 'security' },
    { name: 'Aircrack-ng', icon: Wifi, color: 'text-yellow-400', category: 'network' },
    { name: 'John the Ripper', icon: Zap, color: 'text-red-500', category: 'security' },
    { name: 'Hydra', icon: Code, color: 'text-green-400', category: 'security' }
  ];

  const filteredApps = apps.filter(app => {
    const matchesCategory = activeCategory === 'all' || app.category === activeCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-3">
          {filteredApps.map((app, index) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center p-3 rounded-lg bg-black/30 border border-neon-cyan/30 hover:border-neon-cyan/60 cursor-pointer transition-all duration-300 hover:shadow-neon group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
    </div>
  );
};

export default Launcher;
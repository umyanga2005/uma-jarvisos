import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send } from 'lucide-react';

const Terminal = ({ sendMessage }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', content: '> JarvisOS Terminal v1.0 - Initialized' },
    { type: 'system', content: '> Quantum encryption protocols active' },
    { type: 'system', content: '> Neural network interfaces online' },
    { type: 'info', content: '> Ready for commands...' }
  ]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const executeCommand = (command) => {
    const cmd = command.trim().toLowerCase();
    
    // Add to command history
    setCommandHistory(prev => [...prev, command]);
    
    // Add command to display
    setHistory(prev => [...prev, { type: 'command', content: `> ${command}` }]);
    
    // Handle local commands
    if (cmd === 'clear') {
      setHistory([{ type: 'system', content: '> Terminal cleared' }]);
      return;
    }
    
    // Send command to backend
    if (sendMessage) {
      sendMessage({
        type: 'command',
        data: { command: cmd }
      });
    }
    
    // Simulate command execution for demo
    setTimeout(() => {
      let response = { type: 'output', content: '' };
      
      switch (cmd) {
        case 'help':
          response.content = `Available commands:
- help - Show this help message
- status - System status
- clear - Clear terminal
- scan - Network scan
- jarvis - Activate Jarvis AI
- processes - Show running processes
- network - Show network connections
- hack - Initiate hacking sequence`;
          break;
          
        case 'status':
          if (sendMessage) {
            sendMessage({
              type: 'command',
              data: { command: 'system_status' }
            });
          }
          return;
          
        case 'scan':
          if (sendMessage) {
            sendMessage({
              type: 'command',
              data: { command: 'network_scan' }
            });
          }
          return;
          
        case 'jarvis':
          if (sendMessage) {
            sendMessage({
              type: 'command',
              data: { command: 'jarvis_activate' }
            });
          }
          return;
          
        case 'processes':
          if (sendMessage) {
            sendMessage({
              type: 'get_processes'
            });
          }
          return;
          
        case 'network':
          if (sendMessage) {
            sendMessage({
              type: 'get_network'
            });
          }
          return;
          
        case 'hack':
          response.content = `Initiating hacking sequence...
[████████████████████████████████] 100%
> Access granted to mainframe
> Bypassing security protocols
> Data extraction complete
> Connection terminated`;
          response.type = 'success';
          break;
          
        default:
          if (cmd.startsWith('echo ')) {
            response.content = command.substring(5);
          } else {
            response = { type: 'error', content: `Command not found: ${command}. Type 'help' for available commands.` };
          }
      }
      
      setHistory(prev => [...prev, response]);
    }, Math.random() * 1000 + 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const getLineColor = (type) => {
    switch (type) {
      case 'command': return 'text-neon-cyan';
      case 'output': return 'text-gray-300';
      case 'error': return 'text-red-400';
      case 'success': return 'text-neon-green';
      case 'info': return 'text-neon-blue';
      case 'system': return 'text-yellow-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-neon-cyan">
          <TerminalIcon size={16} />
          <span className="text-sm font-mono">QUANTUM TERMINAL</span>
        </div>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-neon-green"></div>
        </div>
      </div>
      
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto font-mono text-xs space-y-1 scrollbar-thin scrollbar-thumb-neon-cyan/30"
      >
        {history.map((line, index) => (
          <div key={index} className={`${getLineColor(line.type)} whitespace-pre-wrap`}>
            {line.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
        <span className="text-neon-cyan"></span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-neon-cyan outline-none font-mono text-sm placeholder-neon-cyan/50"
          placeholder="Enter command..."
          autoComplete="off"
        />
        <button
          type="submit"
          className="p-1 text-neon-cyan hover:text-neon-green transition-colors"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default Terminal;
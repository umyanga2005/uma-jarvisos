import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send } from 'lucide-react';
import { Terminal as XTerminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css'; // Import xterm.js CSS
import { useApp } from '../context/AppContext'; // To get terminal output from context

const Terminal = ({ sendMessage }) => {
  const { state, dispatch } = useApp(); // Access global state
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const fitAddonRef = useRef(null);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (terminalRef.current && !xtermRef.current) {
      const term = new XTerminal({
        fontFamily: 'monospace',
        fontSize: 12,
        theme: {
          background: 'rgba(0,0,0,0.3)',
          foreground: '#00ffff', // Neon cyan
          cursor: '#00ff00',
          selection: 'rgba(0,255,255,0.3)',
          black: '#000000',
          red: '#ff0000',
          green: '#00ff00',
          yellow: '#ffff00',
          blue: '#0000ff',
          magenta: '#ff00ff',
          cyan: '#00ffff',
          white: '#ffffff',
          brightBlack: '#808080',
          brightRed: '#ff0000',
          brightGreen: '#00ff00',
          brightYellow: '#ffff00',
          brightBlue: '#0000ff',
          brightMagenta: '#ff00ff',
          brightCyan: '#00ffff',
          brightWhite: '#ffffff'
        },
        convertEol: true, // Convert line feeds to carriage returns
        disableStdin: false, // Enable user input
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(terminalRef.current);
      fitAddon.fit();

      xtermRef.current = term;
      fitAddonRef.current = fitAddon;

      // Initial messages
      term.write('\x1b[33m> JarvisOS Terminal v1.0 - Initialized\r\n'); // Yellow
      term.write('\x1b[33m> Quantum encryption protocols active\r\n');
      term.write('\x1b[33m> Neural network interfaces online\r\n');
      term.write('\x1b[36m> Ready for commands...\r\n'); // Cyan
      term.write('\x1b[36m$ \x1b[0m'); // Prompt

      // Handle input from xterm
      term.onData(e => {
        if (e === '\r') { // Enter key
          handleSubmit({ preventDefault: () => {} }); // Simulate form submission
        } else if (e === '\x7F') { // Backspace
          if (input.length > 0) {
            setInput(prev => prev.slice(0, -1));
            term.write('\b \b'); // Erase character from terminal
          }
        } else if (e === '\x1b[A') { // ArrowUp
          handleKeyDown({ key: 'ArrowUp', preventDefault: () => {} });
        } else if (e === '\x1b[B') { // ArrowDown
          handleKeyDown({ key: 'ArrowDown', preventDefault: () => {} });
        } else {
          setInput(prev => prev + e);
          term.write(e);
        }
      });

      // Resize observer for fitting terminal
      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
      });
      resizeObserver.observe(terminalRef.current);

      return () => {
        term.dispose();
        resizeObserver.disconnect();
      };
    }
  }, []);

  // Effect to write new output from context to xterm
  useEffect(() => {
    if (xtermRef.current && state.terminalOutput.length > 0) {
      const lastOutput = state.terminalOutput[state.terminalOutput.length - 1];
      let colorCode = '\x1b[0m'; // Reset color

      switch (lastOutput.type) {
        case 'command': colorCode = '\x1b[36m'; break; // Cyan
        case 'output': colorCode = '\x1b[37m'; break; // White
        case 'error': colorCode = '\x1b[31m'; break; // Red
        case 'success': colorCode = '\x1b[32m'; break; // Green
        case 'info': colorCode = '\x1b[34m'; break; // Blue
        case 'system': colorCode = '\x1b[33m'; break; // Yellow
        default: colorCode = '\x1b[37m'; break;
      }

      xtermRef.current.write(`\r\n${colorCode}${lastOutput.content}\x1b[0m\r\n\x1b[36m$ \x1b[0m`);
      xtermRef.current.scrollToBottom();
      dispatch({ type: 'CLEAR_LAST_TERMINAL_OUTPUT' }); // Clear from context after writing
    }
  }, [state.terminalOutput, dispatch]);


  const executeCommand = (command) => {
    const cmd = command.trim();

    // Add to command history
    setCommandHistory(prev => [...prev, cmd]);

    // Add command to display in xterm
    xtermRef.current.write(`\r\n\x1b[36m$ ${cmd}\x1b[0m\r\n`); // Write command with cyan color

    // Handle local commands
    if (cmd.toLowerCase() === 'clear') {
      xtermRef.current.clear();
      xtermRef.current.write('\x1b[33m> Terminal cleared\r\n');
      xtermRef.current.write('\x1b[36m$ \x1b[0m');
      return;
    }

    // Send command to backend
    if (sendMessage) {
      sendMessage({
        type: 'command',
        data: { command: cmd } // Send raw command to backend
      });
    }

    // Simulate command execution for demo (will be replaced by backend response)
    // setTimeout(() => {
    //   let response = { type: 'output', content: '' };
    //   switch (cmd.toLowerCase()) {
    //     case 'help':
    //       response.content = `Available commands:
    // - help - Show this help message
    // - status - System status
    // - clear - Clear terminal
    // - scan - Network scan
    // - jarvis - Activate Jarvis AI
    // - processes - Show running processes
    // - network - Show network connections
    // - hack - Initiate hacking sequence`;
    //       break;
    //     case 'hack':
    //       response.content = `Initiating hacking sequence...
    // [████████████████████████████████] 100%
    // > Access granted to mainframe
    // > Bypassing security protocols
    // > Data extraction complete
    // > Connection terminated`;
    //       response.type = 'success';
    //       break;
    //     default:
    //       if (cmd.toLowerCase().startsWith('echo ')) {
    //         response.content = command.substring(5);
    //       } else {
    //         response = { type: 'error', content: `Command not found: ${command}. Type 'help' for available commands.` };
    //       }
    //   }
    //   dispatch({ type: 'ADD_TERMINAL_OUTPUT', payload: response });
    // }, Math.random() * 1000 + 500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput('');
      xtermRef.current.write('\x1b[2K\r'); // Clear current line
      xtermRef.current.write('\x1b[36m$ \x1b[0m'); // Rewrite prompt
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        const cmd = commandHistory[commandHistory.length - 1 - newIndex];
        setInput(cmd);
        xtermRef.current.write('\x1b[2K\r\x1b[36m$ \x1b[0m' + cmd); // Clear line, rewrite prompt and command
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const cmd = commandHistory[commandHistory.length - 1 - newIndex];
        setInput(cmd);
        xtermRef.current.write('\x1b[2K\r\x1b[36m$ \x1b[0m' + cmd);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
        xtermRef.current.write('\x1b[2K\r\x1b[36m$ \x1b[0m');
      }
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
        className="flex-1 overflow-hidden rounded-md" // xterm will manage scroll
        style={{ minHeight: '100px' }} // Ensure it has some height
      >
        {/* Xterm.js will render here */}
      </div>

      {/* Input form for fallback/manual input, though xterm handles it */}
      <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2 hidden">
        <span className="text-neon-cyan">$</span>
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
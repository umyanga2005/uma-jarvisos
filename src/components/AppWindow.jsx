import React, { useState } from 'react';
import { X, Minus, Maximize2, CornerDownLeft } from 'lucide-react';
import Draggable from 'react-draggable';

const AppWindow = ({ title, children, onClose }) => {
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);

  const toggleMinimize = () => setMinimized(!minimized);
  const toggleMaximize = () => setMaximized(!maximized);

  return (
    <Draggable handle=".window-header" bounds="parent">
      <div
        className={`absolute bg-black/80 border border-neon-cyan/50 rounded-md shadow-neon text-neon-cyan flex flex-col ${
          maximized ? 'inset-0 m-0 rounded-none' : 'w-96 h-64'
        }`}
        style={{ zIndex: 100 }}
      >
        <div className="window-header flex items-center justify-between bg-black/90 p-2 cursor-move select-none">
          <div className="font-mono font-bold text-sm">{title}</div>
          <div className="flex gap-2">
            <button onClick={toggleMinimize} title="Minimize" className="hover:text-neon-green">
              <Minus size={16} />
            </button>
            <button onClick={toggleMaximize} title="Maximize" className="hover:text-neon-green">
              <Maximize2 size={16} />
            </button>
            <button onClick={onClose} title="Close" className="hover:text-red-500">
              <X size={16} />
            </button>
          </div>
        </div>
        {!minimized && <div className="flex-1 overflow-auto p-2">{children}</div>}
      </div>
    </Draggable>
  );
};

export default AppWindow;
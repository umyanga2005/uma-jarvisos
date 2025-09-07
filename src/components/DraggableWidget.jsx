import React from 'react';
import { motion } from 'framer-motion';
import CustomDraggable from './CustomDraggable';

const DraggableWidget = ({ 
  children, 
  id, 
  position, 
  size, 
  devMode, 
  onPositionChange 
}) => {
  const handleDrag = (e, data) => {
    if (devMode && onPositionChange) {
      onPositionChange(id, { x: data.x, y: data.y });
    }
  };

  return (
    <CustomDraggable
      position={position}
      onDrag={handleDrag}
      disabled={!devMode}
      bounds="parent"
    >
      <motion.div
        className={`glass-panel neon-border rounded-lg overflow-hidden ${
          devMode ? 'dev-mode-active' : ''
        }`}
        style={{
          width: size.width,
          height: size.height,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={devMode ? { scale: 1.02 } : {}}
      >
        <div className="w-full h-full p-4 text-neon-cyan">
          {children}
        </div>
      </motion.div>
    </CustomDraggable>
  );
};

export default DraggableWidget;
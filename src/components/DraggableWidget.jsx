import React from 'react';
import { motion } from 'framer-motion';
import CustomDraggable from './CustomDraggable';

const DraggableWidget = ({
  children,
  id,
  position,
  size, // Pass size prop
  devMode,
  onPositionChange,
  onSizeChange // New prop for size change callback
}) => {
  const handleDrag = (e, data) => {
    if (devMode && onPositionChange) {
      onPositionChange(id, { x: data.x, y: data.y });
    }
  };

  const handleResize = (e, newSize) => { // New handler for resizing
    if (devMode && onSizeChange) {
      onSizeChange(id, newSize);
    }
  };

  return (
    <CustomDraggable
      position={position}
      size={size} // Pass size to CustomDraggable
      onDrag={handleDrag}
      onResize={handleResize} // Pass onResize to CustomDraggable
      disabled={!devMode}
      bounds="parent"
    >
      <motion.div
        className={`glass-panel neon-border rounded-lg overflow-hidden ${
          devMode ? 'dev-mode-active' : ''
        }`}
        style={{
          width: size.width, // Use size from props
          height: size.height, // Use size from props
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
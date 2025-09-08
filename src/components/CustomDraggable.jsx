import React, { useState, useRef, useEffect } from 'react';

const CustomDraggable = ({
  children,
  disabled = false,
  onDrag,
  onResize, // New prop for resize callback
  position = { x: 0, y: 0 },
  size = { width: 300, height: 200 }, // New prop for initial size
  bounds = "parent"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false); // New state for resizing
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 }); // New state for resize start
  const [currentPosition, setCurrentPosition] = useState(position);
  const [currentSize, setCurrentSize] = useState(size); // New state for current size
  const elementRef = useRef(null);

  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  useEffect(() => {
    setCurrentSize(size);
  }, [size]);

  const handleMouseDown = (e) => {
    if (disabled) return;

    // Check if a resize handle was clicked
    if (e.target.dataset.resizeHandle) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: currentSize.width,
        height: currentSize.height,
        handle: e.target.dataset.resizeHandle // Store which handle was clicked
      });
    } else {
      // Otherwise, it's a drag
      setIsDragging(true);
      setDragStart({
        x: e.clientX - currentPosition.x,
        y: e.clientY - currentPosition.y
      });
    }

    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (disabled) return;

    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      let boundedX = newX;
      let boundedY = newY;

      if (bounds === "parent" && elementRef.current) {
        const parent = elementRef.current.parentElement;
        const element = elementRef.current;

        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();

          boundedX = Math.max(0, Math.min(newX, parentRect.width - elementRect.width));
          boundedY = Math.max(0, Math.min(newY, parentRect.height - elementRect.height));
        }
      }

      const newPosition = { x: boundedX, y: boundedY };
      setCurrentPosition(newPosition);

      if (onDrag) {
        onDrag(e, newPosition);
      }
    } else if (isResizing) {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      // Adjust width/height based on which handle is being dragged
      switch (resizeStart.handle) {
        case 'right':
          newWidth = Math.max(100, resizeStart.width + dx); // Min width 100px
          break;
        case 'bottom':
          newHeight = Math.max(100, resizeStart.height + dy); // Min height 100px
          break;
        case 'bottom-right':
          newWidth = Math.max(100, resizeStart.width + dx);
          newHeight = Math.max(100, resizeStart.height + dy);
          break;
        // Add other handles (top, left, top-left, etc.) if needed
        default:
          break;
      }

      const newSize = { width: newWidth, height: newHeight };
      setCurrentSize(newSize);

      if (onResize) {
        onResize(e, newSize);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, currentPosition, currentSize]);

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: currentPosition.x,
        top: currentPosition.y,
        width: currentSize.width, // Apply current size
        height: currentSize.height, // Apply current size
        cursor: disabled ? 'default' : (isDragging ? 'grabbing' : (isResizing ? 'se-resize' : 'grab')),
        zIndex: isDragging || isResizing ? 100 : 10 // Bring to front when dragging/resizing
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      {/* Resize Handles (only visible in dev mode) */}
      {!disabled && (
        <>
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-neon-cyan/50 hover:bg-neon-cyan cursor-se-resize rounded-br-md"
            data-resize-handle="bottom-right"
            onMouseDown={handleMouseDown} // Attach handleMouseDown to handles
            style={{ zIndex: 101 }}
          />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-neon-cyan/50 hover:bg-neon-cyan cursor-s-resize"
            data-resize-handle="bottom"
            onMouseDown={handleMouseDown}
            style={{ zIndex: 101 }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 right-0 h-8 w-2 bg-neon-cyan/50 hover:bg-neon-cyan cursor-e-resize"
            data-resize-handle="right"
            onMouseDown={handleMouseDown}
            style={{ zIndex: 101 }}
          />
        </>
      )}
    </div>
  );
};

export default CustomDraggable;
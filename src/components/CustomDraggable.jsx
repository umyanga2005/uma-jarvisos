import React, { useState, useRef, useEffect } from 'react';

const CustomDraggable = ({ 
  children, 
  disabled = false, 
  onDrag, 
  position = { x: 0, y: 0 },
  bounds = "parent"
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);
  const elementRef = useRef(null);

  useEffect(() => {
    setCurrentPosition(position);
  }, [position]);

  const handleMouseDown = (e) => {
    if (disabled) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - currentPosition.x,
      y: e.clientY - currentPosition.y
    });
    
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || disabled) return;

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
      onDrag(e, { x: boundedX, y: boundedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, currentPosition]);

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: currentPosition.x,
        top: currentPosition.y,
        cursor: disabled ? 'default' : (isDragging ? 'grabbing' : 'grab')
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  );
};

export default CustomDraggable;
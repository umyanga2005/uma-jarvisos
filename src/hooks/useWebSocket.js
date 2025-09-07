// src/hooks/useWebSocket.js
import { useState, useEffect, useRef } from 'react';

export const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(0);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket(url);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setReadyState(1);
          setSocket(ws);
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setReadyState(0);
          setSocket(null);
          
          // Reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setReadyState(3);
        };
        
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setReadyState(3);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (socket && readyState === 1) {
      socket.send(JSON.stringify(message));
    }
  };

  return {
    socket,
    lastMessage,
    readyState,
    sendMessage
  };
};

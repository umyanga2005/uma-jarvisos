import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, AlertTriangle, Info, CheckCircle, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NotificationPanel = () => {
  const { state, dispatch } = useApp();

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timers = state.notifications.map(notification => {
      if (notification.autoRemove !== false) {
        return setTimeout(() => {
          dispatch({
            type: 'REMOVE_NOTIFICATION',
            payload: notification.id
          });
        }, notification.duration || 5000);
      }
      return null;
    });

    return () => {
      timers.forEach(timer => timer && clearTimeout(timer));
    };
  }, [state.notifications, dispatch]);

  const removeNotification = (id) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: id
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'warning': return Shield;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-400 border-red-400';
      case 'success': return 'text-neon-green border-neon-green';
      case 'warning': return 'text-yellow-400 border-yellow-400';
      default: return 'text-neon-cyan border-neon-cyan';
    }
  };

  return (
    <div className="fixed top-4 right-20 z-40 space-y-2 max-w-sm">
      <AnimatePresence>
        {state.notifications.map((notification) => {
          const Icon = getIcon(notification.type);
          const colorClass = getColor(notification.type);
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`glass-panel border rounded-lg p-4 ${colorClass}`}
            >
              <div className="flex items-start gap-3">
                <Icon size={16} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">
                    {notification.title}
                  </h4>
                  <p className="text-xs opacity-80 mt-1">
                    {notification.message}
                  </p>
                  {notification.timestamp && (
                    <p className="text-xs opacity-60 mt-2">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Settings, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

const DevModeToggle = () => {
  const { state, dispatch } = useApp();
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  
  const DEV_PASSWORD = 'jarvis2024';
  const MAX_ATTEMPTS = 3;

  const handleLockClick = () => {
    if (state.devMode) {
      dispatch({ type: 'SET_DEV_MODE', payload: false });
    } else {
      if (attempts >= MAX_ATTEMPTS) {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'error',
            title: 'Access Denied',
            message: 'Too many failed attempts. Please wait.',
            timestamp: Date.now()
          }
        });
        return;
      }
      setShowPasswordInput(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === DEV_PASSWORD) {
      dispatch({ type: 'SET_DEV_MODE', payload: true });
      setShowPasswordInput(false);
      setPassword('');
      setAttempts(0);
      
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'success',
          title: 'Developer Mode',
          message: 'Developer mode activated. Widgets are now draggable.',
          timestamp: Date.now()
        }
      });
    } else {
      setAttempts(prev => prev + 1);
      setPassword('');
      setIsShaking(true);
      
      setTimeout(() => setIsShaking(false), 500);
      
      if (attempts + 1 >= MAX_ATTEMPTS) {
        setShowPasswordInput(false);
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            id: Date.now(),
            type: 'error',
            title: 'Security Alert',
            message: 'Maximum login attempts exceeded.',
            timestamp: Date.now()
          }
        });
      }
    }
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      <motion.button
        onClick={handleLockClick}
        className={`p-3 rounded-lg glass-panel neon-border transition-all duration-300 ${
          state.devMode ? 'text-neon-green shadow-neon' : 'text-neon-cyan'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={isShaking ? { duration: 0.5 } : {}}
      >
        {state.devMode ? <Unlock size={20} /> : <Lock size={20} />}
      </motion.button>

      <AnimatePresence>
        {showPasswordInput && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute top-16 right-0 glass-panel neon-border p-4 rounded-lg min-w-64"
          >
            <div className="flex items-center gap-2 mb-3">
              <Settings size={16} className="text-neon-cyan" />
              <span className="text-sm font-mono text-neon-cyan">DEVELOPER ACCESS</span>
            </div>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="relative mb-3">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter access code"
                  className="w-full pr-10 py-2 bg-transparent border-b border-neon-cyan text-neon-cyan placeholder-neon-cyan/50 outline-none text-sm font-mono"
                  autoFocus
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neon-cyan/60 hover:text-neon-cyan"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400">
                  Attempts: {attempts}/{MAX_ATTEMPTS}
                </span>
                <div className="flex gap-1">
                  {[...Array(MAX_ATTEMPTS)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < attempts ? 'bg-red-400' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={attempts >= MAX_ATTEMPTS}
                  className="flex-1 px-3 py-2 text-xs bg-neon-cyan/20 text-neon-cyan rounded hover:bg-neon-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  ACCESS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordInput(false);
                    setPassword('');
                  }}
                  className="px-3 py-2 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all duration-300"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {state.devMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-16 right-0 text-xs text-neon-green font-mono bg-black/50 px-2 py-1 rounded border border-neon-green/30"
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
            DEV MODE ACTIVE
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DevModeToggle;
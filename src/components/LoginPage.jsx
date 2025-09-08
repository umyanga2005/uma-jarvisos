import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Key, User, Eye, EyeOff, Terminal } from 'lucide-react';
import { useApp } from '../context/AppContext'; // To add notifications

const LoginPage = ({ onLoginSuccess, isFirstLogin }) => {
  const { dispatch } = useApp();
  const [username, setUsername] = useState('admin'); // Default for demo
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'pin'
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  // Simulate backend credentials (for demo purposes only)
  const DEMO_USERNAME = 'admin';
  const DEMO_PASSWORD = 'password123';
  const DEMO_PIN = '1234';

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'error',
          title: 'Access Denied',
          message: 'Too many failed login attempts. Please restart or contact admin.',
          timestamp: Date.now(),
          autoRemove: false, // Keep this notification
        },
      });
    }
  }, [attempts, dispatch]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (attempts >= MAX_ATTEMPTS) return;

    let success = false;
    if (loginMethod === 'password') {
      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        success = true;
      }
    } else if (loginMethod === 'pin') {
      if (username === DEMO_USERNAME && pin === DEMO_PIN) {
        success = true;
      }
    }

    if (success) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'success',
          title: 'Login Successful',
          message: 'Welcome back, Commander.',
          timestamp: Date.now(),
        },
      });
      onLoginSuccess();
    } else {
      setAttempts(prev => prev + 1);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'error',
          title: 'Login Failed',
          message: 'Invalid credentials. Please try again.',
          timestamp: Date.now(),
        },
      });
    }
  };

  const handleFirstTimeSetup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'error',
          title: 'Setup Failed',
          message: 'Passwords do not match.',
          timestamp: Date.now(),
        },
      });
      return;
    }
    if (pin && pin !== confirmPin) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          id: Date.now(),
          type: 'error',
          title: 'Setup Failed',
          message: 'PINs do not match.',
          timestamp: Date.now(),
        },
      });
      return;
    }

    // In a real app, send these to backend to save securely
    console.log('First time setup complete:', { username, password, pin });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now(),
        type: 'success',
        title: 'Setup Complete',
        message: 'Your credentials have been configured. Logging in...',
        timestamp: Date.now(),
      },
    });
    onLoginSuccess(); // Proceed to desktop
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label className="block text-xs font-mono text-neon-cyan mb-1">USERNAME</label>
        <div className="relative">
          <User size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/30 border border-neon-cyan/30 rounded-md text-sm text-neon-cyan placeholder-neon-cyan/50 outline-none focus:border-neon-cyan"
            placeholder="Enter username"
            required
            disabled={attempts >= MAX_ATTEMPTS}
          />
        </div>
      </div>

      {loginMethod === 'password' && (
        <div>
          <label className="block text-xs font-mono text-neon-cyan mb-1">PASSWORD</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-black/30 border border-neon-cyan/30 rounded-md text-sm text-neon-cyan placeholder-neon-cyan/50 outline-none focus:border-neon-cyan"
              placeholder="Enter password"
              required
              disabled={attempts >= MAX_ATTEMPTS}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60 hover:text-neon-cyan"
              disabled={attempts >= MAX_ATTEMPTS}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      )}

      {loginMethod === 'pin' && (
        <div>
          <label className="block text-xs font-mono text-neon-cyan mb-1">PIN</label>
          <div className="relative">
            <Key size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60" />
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-black/30 border border-neon-cyan/30 rounded-md text-sm text-neon-cyan placeholder-neon-cyan/50 outline-none focus:border-neon-cyan"
              placeholder="Enter PIN"
              maxLength={4}
              required
              disabled={attempts >= MAX_ATTEMPTS}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60 hover:text-neon-cyan"
              disabled={attempts >= MAX_ATTEMPTS}
            >
              {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>Attempts: {attempts}/{MAX_ATTEMPTS}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setLoginMethod('password')}
            className={`px-3 py-1 rounded-full transition-colors ${loginMethod === 'password' ? 'bg-neon-cyan/30 text-neon-cyan' : 'bg-gray-700/50 text-gray-400 hover:text-neon-cyan'}`}
            disabled={attempts >= MAX_ATTEMPTS}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('pin')}
            className={`px-3 py-1 rounded-full transition-colors ${loginMethod === 'pin' ? 'bg-neon-cyan/30 text-neon-cyan' : 'bg-gray-700/50 text-gray-400 hover:text-neon-cyan'}`}
            disabled={attempts >= MAX_ATTEMPTS}
          >
            PIN
          </button>
        </div>
      </div>

      <motion.button
        type="submit"
        className="w-full py-2 glass-panel neon-border rounded-md text-sm font-bold text-neon-green hover:bg-neon-green/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={attempts >= MAX_ATTEMPTS}
      >
        ACCESS SYSTEM
      </motion.button>
    </form>
  );

  const renderFirstTimeSetupForm = () => (
    <form onSubmit={handleFirstTimeSetup} className="space-y-4">
      <p className="text-xs text-neon-cyan/80 text-center">
        This is your first login. Please configure your credentials.
      </p>
      <div>
        <label className="block text-xs font-mono text-neon-cyan mb-1">USERNAME</label>
        <div className="relative">
          <User size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-black/30 border border-neon-cyan/30 rounded-md text-sm text-neon-cyan placeholder-neon-cyan/50 outline-none focus:border-neon-cyan"
            placeholder="Choose username"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-mono text-neon-cyan mb-1">NEW PASSWORD</label>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 pr-10 py-2 bg-black/30 border border-neon-cyan/30 rounded-md text-sm text-neon-cyan placeholder-neon-cyan/50 outline-none focus:border-neon-cyan"
            placeholder="Set password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60 hover:text-neon-cyan"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-mono text-neon-cyan mb-1">CONFIRM PASSWORD</label>
        <div className="relative">
          <Lock size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-9 pr-10 py-2 bg-black/30 border border-neon-cyan/30 rounded-md text-sm text-neon-cyan placeholder-neon-cyan/50 outline-none focus:border-neon-cyan"
            placeholder="Confirm password"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-mono text-neon-cyan mb-1">NEW PIN (Optional)</label>
        <div className="relative">
          <Key size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60" />
          <input
            type={showPin ? 'text' : 'password'}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full pl-9 pr-10 py-2 bg-black/30 border border-neon-cyan/30 rounded-md text-sm text-neon-cyan placeholder-neon-cyan/50 outline-none focus:border-neon-cyan"
            placeholder="Set 4-digit PIN"
            maxLength={4}
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60 hover:text-neon-cyan"
          >
            {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-mono text-neon-cyan mb-1">CONFIRM PIN</label>
        <div className="relative">
          <Key size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan/60" />
          <input
            type={showPin ? 'text' : 'password'}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="w-full pl-9 pr-10 py-2 bg-black/30 border border-neon-cyan/30 rounded-md text-sm text-neon-cyan placeholder-neon-cyan/50 outline-none focus:border-neon-cyan"
            placeholder="Confirm PIN"
            maxLength={4}
          />
        </div>
      </div>
      <motion.button
        type="submit"
        className="w-full py-2 glass-panel neon-border rounded-md text-sm font-bold text-neon-green hover:bg-neon-green/20 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        CONFIGURE & ACCESS
      </motion.button>
    </form>
  );

  return (
    <div className="w-screen h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="w-full h-full"
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear'
          }}
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel neon-border p-8 rounded-lg shadow-neon-strong max-w-md w-full z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <Terminal size={48} className="text-neon-cyan mb-2" />
          <h1 className="text-2xl font-bold text-neon-cyan font-mono">JARVISOS</h1>
          <p className="text-sm text-gray-400 mt-1">SYSTEM ACCESS PROTOCOL</p>
        </div>

        {isFirstLogin ? renderFirstTimeSetupForm() : renderLoginForm()}
      </motion.div>

      {/* Ambient Glow Effects */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-neon-cyan rounded-full opacity-20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-40 h-40 bg-neon-blue rounded-full opacity-15 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1
        }}
      />
    </div>
  );
};

export default LoginPage;
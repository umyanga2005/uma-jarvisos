import React, { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import JarvisDesktop from './components/JarvisDesktop';
import LoginPage from './components/LoginPage'; // New import
import './index.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(true); // Simulate first login

  useEffect(() => {
    // In a real app, you'd check localStorage or a backend API
    // to determine if it's the first login or if a session exists.
    const storedAuth = localStorage.getItem('jarvis_authenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      setIsFirstLogin(false);
    } else {
      setIsAuthenticated(false);
      // For demo, assume first login if not authenticated
      setIsFirstLogin(localStorage.getItem('jarvis_first_login_done') !== 'true');
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('jarvis_authenticated', 'true');
    localStorage.setItem('jarvis_first_login_done', 'true'); // Mark first login as done
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('jarvis_authenticated');
  };

  return (
    <AppProvider>
      {isAuthenticated ? (
        <JarvisDesktop onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} isFirstLogin={isFirstLogin} />
      )}
    </AppProvider>
  );
};

export default App;
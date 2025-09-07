import React from 'react';
import { AppProvider } from './context/AppContext';
import JarvisDesktop from './components/JarvisDesktop';
import './index.css';

const App = () => {
  return (
    <AppProvider>
      <JarvisDesktop />
    </AppProvider>
  );
};

export default App;
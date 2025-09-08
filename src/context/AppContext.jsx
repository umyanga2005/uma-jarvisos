import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  devMode: false,
  systemStats: null,
  notifications: [],
  jarvisStatus: {
    listening: false,
    speaking: false,
    processing: false,
  },
  terminalOutput: [], // New state for terminal output
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DEV_MODE':
      return { ...state, devMode: action.payload };
    case 'UPDATE_SYSTEM_STATS':
      return { ...state, systemStats: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.payload
        ),
      };
    case 'UPDATE_JARVIS_STATUS':
      return { ...state, jarvisStatus: { ...state.jarvisStatus, ...action.payload } };
    case 'ADD_TERMINAL_OUTPUT': // New reducer case
      return { ...state, terminalOutput: [...state.terminalOutput, action.payload] };
    case 'CLEAR_LAST_TERMINAL_OUTPUT': // New reducer case to clear after processing
      return { ...state, terminalOutput: state.terminalOutput.slice(0, -1) };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
// src/context/AppContext.jsx
import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  devMode: false,
  widgets: [],
  notifications: [],
  systemStats: {
    cpu: 0,
    memory: 0,
    disk: 0,
    network: { download: 0, upload: 0 }
  },
  jarvisStatus: {
    listening: false,
    speaking: false,
    processing: false
  }
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_DEV_MODE':
      return { ...state, devMode: !state.devMode };
    
    case 'UPDATE_WIDGET_POSITION':
      return {
        ...state,
        widgets: state.widgets.map(widget =>
          widget.id === action.payload.id
            ? { ...widget, position: action.payload.position }
            : widget
        )
      };
    
    case 'UPDATE_SYSTEM_STATS':
      return { ...state, systemStats: { ...state.systemStats, ...action.payload } };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'UPDATE_JARVIS_STATUS':
      return {
        ...state,
        jarvisStatus: { ...state.jarvisStatus, ...action.payload }
      };
    
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
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

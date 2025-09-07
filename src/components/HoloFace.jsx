import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Ring, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const JarvisFace = () => {
  const { state } = useApp();
  const meshRef = useRef();
  const ringRef = useRef();
  
  useFrame((frameState) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(frameState.clock.elapsedTime) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += state.jarvisStatus?.listening ? 0.02 : 0.01;
    }
  });

  return (
    <group>
      {/* Main Face Sphere */}
      <Sphere ref={meshRef} args={[1, 32, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color={state.jarvisStatus?.listening ? "#00ff00" : "#00ffff"} 
          wireframe 
          transparent 
          opacity={0.3}
        />
      </Sphere>
      
      {/* Rotating Rings */}
      <Ring ref={ringRef} args={[1.2, 1.3, 32]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color={state.jarvisStatus?.listening ? "#00ff00" : "#00ffff"} 
          transparent 
          opacity={0.6} 
        />
      </Ring>
      
      <Ring args={[1.5, 1.6, 32]} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshBasicMaterial 
          color="#0080ff" 
          transparent 
          opacity={0.4} 
        />
      </Ring>
      
      {/* Jarvis Text */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.3}
        color={state.jarvisStatus?.listening ? "#00ff00" : "#00ffff"}
        anchorX="center"
        anchorY="middle"
      >
        J.A.R.V.I.S
      </Text>
    </group>
  );
};

const HoloFace = ({ sendMessage }) => {
  const { state, dispatch } = useApp();
  const [isListening, setIsListening] = useState(false);

  const handleVoiceCommand = () => {
    const newListening = !isListening;
    setIsListening(newListening);
    
    if (sendMessage) {
      sendMessage({
        type: 'command',
        data: { command: 'jarvis_activate' }
      });
    }
    
    dispatch({
      type: 'UPDATE_JARVIS_STATUS',
      payload: { listening: newListening }
    });
  };

  return (
    <motion.div
      className="w-64 h-64 relative"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      {/* Canvas Container */}
      <div className="w-full h-full rounded-full border border-neon-cyan/30 shadow-neon-strong overflow-hidden">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <JarvisFace />
        </Canvas>
      </div>
      
      {/* Status Indicators */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        <div className={`w-3 h-3 rounded-full ${
          state.jarvisStatus?.listening ? 'bg-neon-green animate-pulse' : 'bg-gray-600'
        }`} />
        <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse" />
        <div className="w-3 h-3 rounded-full bg-neon-blue animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      
      {/* Voice Command Button */}
      <motion.button
        className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 px-4 py-2 glass-panel neon-border rounded-lg text-xs"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleVoiceCommand}
      >
        {state.jarvisStatus?.listening ? 'LISTENING...' : 'VOICE COMMAND'}
      </motion.button>
    </motion.div>
  );
};

export default HoloFace;

import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Ring, Text, useGLTF } from '@react-three/drei'; // Import useGLTF
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

// Component to load and display the 3D model
const JarvisHeadModel = () => {
  // Replace 'path/to/your_jarvis_head.glb' with your actual model path
  // You can find free GLB models on Sketchfab, Poly Pizza, etc.
  // For now, we'll use a simple placeholder if no model is provided.
  // Example: const { scene } = useGLTF('/models/jarvis_head.glb');

  // Placeholder: If you have a GLB model, uncomment and replace the path
  // const { scene } = useGLTF('/models/jarvis_head.glb'); // Assuming you put your model in public/models/

  // For now, let's just use a simple sphere as a placeholder if no model is loaded
  const meshRef = useRef();
  useFrame((frameState) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(frameState.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* If you have a GLB model, uncomment this and remove the sphere */}
      {/* <primitive object={scene} scale={1} /> */}
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.3} />
    </mesh>
  );
};


const JarvisFace = () => {
  const { state } = useApp();
  const ringRef = useRef();

  useFrame((frameState) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += state.jarvisStatus?.listening ? 0.02 : 0.01;
    }
  });

  return (
    <group>
      {/* Main Face Model (or placeholder) */}
      <JarvisHeadModel />

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

  const handleVoiceCommand = () => {
    const newListening = !state.jarvisStatus?.listening; // Toggle listening state
    if (sendMessage) {
      sendMessage({
        type: 'command',
        data: { command: 'jarvis_activate', listening: newListening } // Send listening state
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
          <Suspense fallback={null}> {/* Use Suspense for loading 3D models */}
            <JarvisFace />
          </Suspense>
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
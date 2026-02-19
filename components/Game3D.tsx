import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars, Environment, PerspectiveCamera, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { SkinType } from '../types';

interface Game3DProps {
  speedLevel: number;
  skin: string;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

// --- Interfaces ---
interface PlayerProps {
  position: THREE.Vector3;
  rotation: number;
  skin: string;
}

interface EnemyProps {
  position: THREE.Vector3;
  rotation: number;
}

// --- Constants ---
const BOUNDARY = 40;
const PLAYER_BASE_SPEED = 0.2;
const ENEMY_SPEED = 0.16;
const SPAWN_RATE = 200; // Frames

// --- Helper Components ---

const Player: React.FC<PlayerProps> = ({ position, rotation, skin }) => {
  const color = useMemo(() => {
    switch(skin) {
      case SkinType.GOLD: return '#FFD700';
      case SkinType.NEON: return '#00FFDD';
      case SkinType.STEALTH: return '#333333';
      default: return '#3B82F6'; // Classic Blue
    }
  }, [skin]);

  const emissive = useMemo(() => {
     if (skin === SkinType.NEON) return '#00AA99';
     if (skin === SkinType.GOLD) return '#553300';
     return '#000000';
  }, [skin]);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Car Body */}
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 0.6, 2]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={skin === SkinType.NEON ? 2 : 0.5} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.8, -0.2]}>
         <boxGeometry args={[0.8, 0.5, 1]} />
         <meshStandardMaterial color="#111" />
      </mesh>
      {/* Wheels */}
      <mesh position={[0.6, 0.3, 0.6]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-0.6, 0.3, 0.6]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.6, 0.3, -0.6]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-0.6, 0.3, -0.6]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
};

const Enemy: React.FC<EnemyProps> = ({ position, rotation }) => {
  // Flashing lights logic
  const [flash, setFlash] = useState(false);
  useFrame((state) => {
    const shouldFlash = state.clock.elapsedTime % 0.5 < 0.25;
    if (flash !== shouldFlash) setFlash(shouldFlash);
  });

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Car Body */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.1, 0.7, 2.1]} />
        <meshStandardMaterial color="#111" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Siren Bar */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Lights */}
      <mesh position={[0.3, 1.05, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.15]} />
        <meshBasicMaterial color={flash ? "red" : "#300"} />
      </mesh>
      <mesh position={[-0.3, 1.05, 0]}>
        <boxGeometry args={[0.3, 0.15, 0.15]} />
        <meshBasicMaterial color={!flash ? "blue" : "#003"} />
      </mesh>
    </group>
  );
};

const Floor = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#1a1a2e" />
    </mesh>
  );
};

const Grid = () => {
    return <gridHelper args={[100, 50, 0x444444, 0x222222]} position={[0, 0.01, 0]} />
}

const Buildings = () => {
  // Generate random buildings
  const buildings = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 40; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      if (Math.abs(x) < 5 && Math.abs(z) < 5) continue; // Clear center
      const height = 5 + Math.random() * 15;
      const width = 2 + Math.random() * 5;
      const depth = 2 + Math.random() * 5;
      arr.push({ 
        x, z, width, depth, height, 
        hasWindows: Math.random() > 0.5 
      });
    }
    return arr;
  }, []);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.height / 2, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.width, b.height, b.depth]} />
          <meshStandardMaterial color="#0f172a" metalness={0.1} roughness={0.8} />
          {/* Windows emission simulation */}
          {b.hasWindows && (
             <mesh position={[0, 0, b.depth/2 + 0.01]}>
                <planeGeometry args={[b.width * 0.8, b.height * 0.8]} />
                <meshStandardMaterial color="#FDE047" emissive="#FDE047" emissiveIntensity={0.5} transparent opacity={0.3} />
             </mesh>
          )}
        </mesh>
      ))}
    </group>
  );
};

// --- Main Scene ---

const GameScene = ({ speedLevel, skin, onGameOver, onScoreUpdate }: Game3DProps) => {
  const playerPos = useRef(new THREE.Vector3(0, 0, 0));
  const playerVel = useRef(new THREE.Vector3(0, 0, 0));
  const playerRot = useRef(0);
  
  const [playerVisualPos, setPlayerVisualPos] = useState(new THREE.Vector3(0, 0, 0));
  const [playerVisualRot, setPlayerVisualRot] = useState(0);

  const [enemies, setEnemies] = useState<{ id: number; pos: THREE.Vector3; rot: number }[]>([]);
  const nextEnemyId = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});
  const score = useRef(0);
  const frameCount = useRef(0);

  // Input Handling
  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current[e.code] = true;
    const up = (e: KeyboardEvent) => keys.current[e.code] = false;
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((state, delta) => {
    frameCount.current++;
    score.current += delta * 10;
    
    // Update Score UI less frequently
    if (frameCount.current % 10 === 0) {
      onScoreUpdate(Math.floor(score.current));
    }

    // --- Player Movement ---
    const speed = PLAYER_BASE_SPEED * (1 + (speedLevel * 0.1));
    const turnSpeed = 3.5 * delta;

    if (keys.current['ArrowUp'] || keys.current['KeyW']) {
      playerVel.current.z = -speed;
    } else if (keys.current['ArrowDown'] || keys.current['KeyS']) {
      playerVel.current.z = speed;
    } else {
      playerVel.current.z *= 0.9; // Friction
    }

    if (Math.abs(playerVel.current.z) > 0.01) {
       if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
          playerRot.current += turnSpeed;
       }
       if (keys.current['ArrowRight'] || keys.current['KeyD']) {
          playerRot.current -= turnSpeed;
       }
    }

    const moveX = Math.sin(playerRot.current) * playerVel.current.z;
    const moveZ = Math.cos(playerRot.current) * playerVel.current.z;

    playerPos.current.x -= moveX;
    playerPos.current.z -= moveZ;

    // Boundaries
    if (playerPos.current.x > BOUNDARY) playerPos.current.x = BOUNDARY;
    if (playerPos.current.x < -BOUNDARY) playerPos.current.x = -BOUNDARY;
    if (playerPos.current.z > BOUNDARY) playerPos.current.z = BOUNDARY;
    if (playerPos.current.z < -BOUNDARY) playerPos.current.z = -BOUNDARY;

    setPlayerVisualPos(playerPos.current.clone());
    setPlayerVisualRot(playerRot.current);

    // --- Camera Follow ---
    state.camera.position.x = playerPos.current.x + 20;
    state.camera.position.z = playerPos.current.z + 20;
    state.camera.position.y = 25;
    state.camera.lookAt(playerPos.current);

    // --- Enemy Logic ---
    // Spawn
    if (frameCount.current % SPAWN_RATE === 0) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30;
      const spawnPos = new THREE.Vector3(
        playerPos.current.x + Math.sin(angle) * dist,
        0,
        playerPos.current.z + Math.cos(angle) * dist
      );
      setEnemies(prev => [...prev, { id: nextEnemyId.current++, pos: spawnPos, rot: 0 }]);
    }

    // Move & Collide
    setEnemies(prev => {
      return prev.map(enemy => {
        const dir = new THREE.Vector3().subVectors(playerPos.current, enemy.pos).normalize();
        const dist = enemy.pos.distanceTo(playerPos.current);
        
        // Simple collision
        if (dist < 1.5) {
          onGameOver(Math.floor(score.current));
        }

        // Move towards player
        // Note: We clone the position to ensure a new reference is created so React detects the update.
        const newPos = enemy.pos.clone().add(dir.multiplyScalar(ENEMY_SPEED));
        
        // Rotate towards player
        const newRot = Math.atan2(dir.x, dir.z);

        return { ...enemy, pos: newPos, rot: newRot };
      });
    });

  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[50, 50, 20]} 
        intensity={1} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
      />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Player position={playerVisualPos} rotation={playerVisualRot} skin={skin} />
      
      {enemies.map(e => (
        <Enemy key={e.id} position={e.pos} rotation={e.rot} />
      ))}

      <Buildings />
      <Floor />
      <Grid />
    </>
  );
};

export default function Game3D(props: Game3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <PerspectiveCamera makeDefault fov={50} />
        <GameScene {...props} />
      </Canvas>
    </div>
  );
}
import React, { useEffect, useState } from 'react';

interface Flower {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  opacity: number;
  xVelocity: number;
  yVelocity: number;
  rotationVelocity: number;
}

interface FlowerConfettiProps {
  active: boolean;
}

const COLORS = [
  '#FF5252', // Red
  '#FF9800', // Orange
  '#FFEB3B', // Yellow
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#FF4081', // Pink
];

export default function FlowerConfetti({ active }: FlowerConfettiProps) {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  
  // Create new flowers
  useEffect(() => {
    if (!active) {
      setFlowers([]);
      return;
    }
    
    // Create initial flowers
    const newFlowers: Flower[] = [];
    for (let i = 0; i < 40; i++) {
      newFlowers.push(createFlower(i));
    }
    setFlowers(newFlowers);
    
    // Animation loop
    const interval = setInterval(() => {
      setFlowers(prevFlowers => {
        return prevFlowers.map(flower => {
          // Update position
          const x = flower.x + flower.xVelocity;
          const y = flower.y + flower.yVelocity;
          const rotation = flower.rotation + flower.rotationVelocity;
          
          // Update opacity (fade out)
          const opacity = Math.max(0, flower.opacity - 0.005);
          
          // Remove flowers that are off-screen or faded out
          if (y > window.innerHeight || opacity <= 0) {
            return createFlower(flower.id);
          }
          
          return {
            ...flower,
            x,
            y,
            rotation,
            opacity,
            yVelocity: flower.yVelocity + 0.05, // Gravity effect
          };
        });
      });
    }, 16); // ~60fps
    
    return () => clearInterval(interval);
  }, [active]);
  
  // Function to create a new flower
  const createFlower = (id: number): Flower => {
    return {
      id,
      x: Math.random() * window.innerWidth,
      y: Math.random() * -100 - 50, // Start above the screen
      size: Math.random() * 20 + 10,
      rotation: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.8 + Math.random() * 0.2,
      xVelocity: (Math.random() - 0.5) * 2,
      yVelocity: Math.random() * 2 + 1,
      rotationVelocity: (Math.random() - 0.5) * 4,
    };
  };
  
  if (!active) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {flowers.map(flower => (
        <div
          key={flower.id}
          className="absolute"
          style={{
            left: `${flower.x}px`,
            top: `${flower.y}px`,
            transform: `rotate(${flower.rotation}deg)`,
            opacity: flower.opacity,
            transition: 'opacity 0.5s',
          }}
        >
          <svg
            width={flower.size}
            height={flower.size}
            viewBox="0 0 24 24"
            fill={flower.color}
          >
            <path d="M12,1C12,1,12,1,12,1c-0.5,2.5-4,3-5.5,5c-1.5,2-0.5,5.5-2.5,7c-2,1.5-5.5,0.5-7,2.5c-1.5,2-1,5.5-3,7
                    c0,0,0,0,0,0c2.5,0.5,3,4,5,5.5c2,1.5,5.5,0.5,7,2.5c1.5,2,0.5,5.5,2.5,7c0,0,0,0,0,0c0.5-2.5,4-3,5.5-5
                    c1.5-2,0.5-5.5,2.5-7c2-1.5,5.5-0.5,7-2.5c1.5-2,1-5.5,3-7c0,0,0,0,0,0c-2.5-0.5-3-4-5-5.5c-2-1.5-5.5-0.5-7-2.5
                    C13.5,6,14.5,2.5,12.5,1C12.5,1,12.5,1,12,1z" />
            <circle cx="12" cy="12" r="3" fill="#FFF176" />
          </svg>
        </div>
      ))}
    </div>
  );
}

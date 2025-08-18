"use client";

import { useEffect, useState } from "react";

interface CodeHighlightOverlayProps {
  isActive: boolean;
  selectionBounds: {
    top: number;
    left: number;
    width: number;
    height: number;
  } | null;
  onClose: () => void;
}

export default function CodeHighlightOverlay({
  isActive,
  selectionBounds,
  onClose,
}: CodeHighlightOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log("CodeHighlightOverlay - isActive:", isActive, "selectionBounds:", selectionBounds);
    if (isActive && selectionBounds) {
      console.log("Activating overlay with bounds:", selectionBounds);
      // Small delay for smooth animation
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isActive, selectionBounds]);

  if (!isActive || !selectionBounds) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      {/* Dimmed background overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" />
      
      {/* Spotlight effect - creates the "hole" for the highlighted code */}
      <div
        className="absolute transition-all duration-700 ease-in-out transform"
        style={{
          top: `${selectionBounds.top - 20}px`,
          left: `${selectionBounds.left - 20}px`,
          width: `${selectionBounds.width + 40}px`,
          height: `${selectionBounds.height + 40}px`,
          boxShadow: `
            0 0 0 20px rgba(0, 0, 0, 0.7),
            0 0 50px 10px rgba(34, 197, 94, 0.3),
            inset 0 0 0 3px rgba(34, 197, 94, 0.6),
            0 0 100px 20px rgba(34, 197, 94, 0.1)
          `,
          borderRadius: '8px',
          animation: isVisible ? 'pulse-glow 2s ease-in-out infinite alternate' : 'none',
        }}
      />

      {/* Animated border around the selection */}
      <div
        className="absolute border-2 border-green-400 rounded-lg transition-all duration-700 ease-in-out"
        style={{
          top: `${selectionBounds.top - 15}px`,
          left: `${selectionBounds.left - 15}px`,
          width: `${selectionBounds.width + 30}px`,
          height: `${selectionBounds.height + 30}px`,
          animation: isVisible ? 'border-dance 3s linear infinite' : 'none',
        }}
      />

      {/* Focus indicator with animated arrows */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          top: `${selectionBounds.top - 60}px`,
          left: `${selectionBounds.left + selectionBounds.width / 2 - 50}px`,
          width: '100px',
          height: '40px',
        }}
      >
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg animate-bounce">
          Focus Here
        </div>
      </div>

      {/* Corner indicators */}
      <div
        className="absolute w-6 h-6 border-l-4 border-t-4 border-green-400 rounded-tl-lg animate-pulse"
        style={{
          top: `${selectionBounds.top - 25}px`,
          left: `${selectionBounds.left - 25}px`,
        }}
      />
      <div
        className="absolute w-6 h-6 border-r-4 border-t-4 border-green-400 rounded-tr-lg animate-pulse"
        style={{
          top: `${selectionBounds.top - 25}px`,
          right: `calc(100% - ${selectionBounds.left + selectionBounds.width + 25}px)`,
        }}
      />
      <div
        className="absolute w-6 h-6 border-l-4 border-b-4 border-green-400 rounded-bl-lg animate-pulse"
        style={{
          bottom: `calc(100% - ${selectionBounds.top + selectionBounds.height + 25}px)`,
          left: `${selectionBounds.left - 25}px`,
        }}
      />
      <div
        className="absolute w-6 h-6 border-r-4 border-b-4 border-green-400 rounded-br-lg animate-pulse"
        style={{
          bottom: `calc(100% - ${selectionBounds.top + selectionBounds.height + 25}px)`,
          right: `calc(100% - ${selectionBounds.left + selectionBounds.width + 25}px)`,
        }}
      />

      {/* Close instruction */}
      <div className="absolute top-8 right-8 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm">Click anywhere to close</p>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0% {
            box-shadow: 
              0 0 0 20px rgba(0, 0, 0, 0.7),
              0 0 50px 10px rgba(34, 197, 94, 0.3),
              inset 0 0 0 3px rgba(34, 197, 94, 0.6),
              0 0 100px 20px rgba(34, 197, 94, 0.1);
          }
          100% {
            box-shadow: 
              0 0 0 20px rgba(0, 0, 0, 0.7),
              0 0 60px 15px rgba(34, 197, 94, 0.5),
              inset 0 0 0 3px rgba(34, 197, 94, 0.8),
              0 0 120px 30px rgba(34, 197, 94, 0.2);
          }
        }

        @keyframes border-dance {
          0% {
            border-color: rgba(34, 197, 94, 1);
          }
          25% {
            border-color: rgba(59, 130, 246, 1);
          }
          50% {
            border-color: rgba(168, 85, 247, 1);
          }
          75% {
            border-color: rgba(236, 72, 153, 1);
          }
          100% {
            border-color: rgba(34, 197, 94, 1);
          }
        }
      `}</style>
    </div>
  );
}

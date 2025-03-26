
import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  color?: string;
}

export function AudioVisualizer({ isActive, color = "#1EAEDB" }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number>(0);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    const particles: { x: number; y: number; size: number; speed: number; angle: number }[] = [];
    const particleCount = 500;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 100 + Math.random() * 20;
      particles.push({
        x: Math.cos(angle) * radius + canvas.clientWidth / 2,
        y: Math.sin(angle) * radius + canvas.clientHeight / 2,
        size: 1 + Math.random() * 2,
        speed: 0.5 + Math.random() * 1,
        angle: angle
      });
    }
    
    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      
      // Draw particles
      particles.forEach(particle => {
        // If active, particles move in circular pattern
        if (isActive) {
          particle.angle += 0.01 * particle.speed;
          const radius = 100 + Math.sin(Date.now() / 1000) * 10;
          particle.x = Math.cos(particle.angle) * radius + canvas.clientWidth / 2;
          particle.y = Math.sin(particle.angle) * radius + canvas.clientHeight / 2;
        }
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });
      
      // Request next frame
      requestIdRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(requestIdRef.current);
      window.removeEventListener('resize', setCanvasDimensions);
    };
  }, [isActive, color]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full rounded-full"
    />
  );
}

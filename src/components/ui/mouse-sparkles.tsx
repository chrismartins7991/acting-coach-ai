"use client";
import React, { useEffect, useRef } from 'react';

interface MouseSparklesProps {
  color?: string;
}

export const MouseSparkles = ({ color = "#FFD700" }: MouseSparklesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    life: number;
    maxLife: number;
  }>>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number>();
  const isHoveringRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const createParticle = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      return {
        x,
        y,
        size: Math.random() * 3 + 1,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        life: 0,
        maxLife: Math.random() * 20 + 10,
      };
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Only add new particles if hovering
      if (isHoveringRef.current && Math.random() < 0.3) {
        particlesRef.current.push(createParticle(mouseRef.current.x, mouseRef.current.y));
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life++;

        const opacity = 1 - (particle.life / particle.maxLife);
        ctx.fillStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        return particle.life < particle.maxLife;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHoveringRef.current) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseEnter = () => {
      isHoveringRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-auto"
    />
  );
};
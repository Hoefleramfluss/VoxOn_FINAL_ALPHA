import React, { useEffect, useRef } from 'react';
import { AudioVisualizerProps } from '../types';

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas if inactive
    if (!isActive || !analyser) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw a simple idle line
        ctx.beginPath();
        ctx.strokeStyle = '#334155'; // slate-700
        ctx.lineWidth = 2;
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      // Get Frequency Data instead of Time Domain for Spectrum Analysis
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#020617'; // slate-950 (matching container bg)
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Calculate bar width (spread across canvas)
      // Multiply by 2.5 to spread the relevant lower frequencies across more space
      const barWidth = (canvas.width / bufferLength) * 2.5; 
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // Scale height: max value 255 maps to half canvas height
        barHeight = (dataArray[i] / 255) * (canvas.height / 2);
        
        // Ensure a tiny bit of height so it doesn't disappear completely
        if (barHeight < 2) barHeight = 2;

        // --- COLOR LOGIC FOR FREQUENCY RANGES ---
        let r, g, b;
        
        if (i < bufferLength * 0.1) {
            // Sub-Bass / Lows: Deep Indigo
            r = 99; g = 102; b = 241; // indigo-500
        } else if (i < bufferLength * 0.3) {
             // Mids / Voice Range: Sky Blue
             r = 56; g = 189; b = 248; // sky-400
        } else {
             // Highs / Air: Teal/Emerald
             r = 45; g = 212; b = 191; // teal-400
        }

        // --- AMPLITUDE INDICATION ---
        // Opacity increases with volume (dataArray[i])
        const alpha = Math.max(0.3, dataArray[i] / 255);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

        // --- MIRRORED BAR DRAWING ---
        const yCenter = canvas.height / 2;

        // Top half
        ctx.fillRect(x, yCenter - barHeight, barWidth, barHeight);
        // Bottom half
        ctx.fillRect(x, yCenter, barWidth, barHeight);

        x += barWidth + 1; // 1px spacing
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isActive]);

  return (
    <div className="w-full h-48 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center relative">
        {!isActive && (
            <div className="absolute text-slate-500 text-sm font-medium animate-pulse">
                Waiting for connection...
            </div>
        )}
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-full"
      />
    </div>
  );
};

export default AudioVisualizer;
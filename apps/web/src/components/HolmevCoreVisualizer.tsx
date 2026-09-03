import * as React from "react";
import { useEffect, useRef } from "react";
import { VoiceState, EmotionMood } from "@holmev/shared-types";

interface Props {
  voiceState: VoiceState;
  audioLevel: number;
  mood: EmotionMood;
}

export const HolmevCoreVisualizer: React.FC<Props> = ({ voiceState, audioLevel, mood }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let rotation = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 80 + audioLevel * 45;

      rotation += 0.015;

      // Color scheme based on state & mood
      let glowColor = "0, 243, 255"; // Cyan JARVIS default
      if (voiceState === "THINKING") glowColor = "0, 102, 255"; // Deep blue
      else if (voiceState === "SPEAKING") glowColor = "50, 255, 126"; // Vibrant neon green
      else if (voiceState === "INTERRUPTED") glowColor = "255, 159, 26"; // Orange
      else if (voiceState === "ERROR" || voiceState === "DEACTIVATED") glowColor = "255, 77, 77"; // Red

      // Outer Rotating Arc Ring 1
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius + 20, 0, Math.PI * 1.3);
      ctx.strokeStyle = `rgba(${glowColor}, 0.8)`;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(${glowColor}, 0.9)`;
      ctx.stroke();
      ctx.restore();

      // Outer Rotating Arc Ring 2 (Counter-rotation)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-rotation * 1.5);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius + 35, Math.PI, Math.PI * 2.4);
      ctx.strokeStyle = `rgba(${glowColor}, 0.4)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Central Pulsing Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.1,
        centerX,
        centerY,
        baseRadius
      );
      gradient.addColorStop(0, `rgba(${glowColor}, 0.95)`);
      gradient.addColorStop(0.6, `rgba(${glowColor}, 0.45)`);
      gradient.addColorStop(1, `rgba(${glowColor}, 0.0)`);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core H.O.L.M.E.V Symbol Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(voiceState, centerX, centerY);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [voiceState, audioLevel, mood]);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        className="w-80 h-80 pointer-events-none drop-shadow-[0_0_25px_rgba(0,243,255,0.4)]"
      />
      <div className="mt-2 text-center">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-mono">
          FACE MOOD: <span className="text-white font-bold">{mood}</span>
        </span>
      </div>
    </div>
  );
};

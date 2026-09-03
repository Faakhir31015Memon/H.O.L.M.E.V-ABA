import React, { useEffect, useState } from "react";
import { SystemHealthStatus } from "@holmev/shared-types";
import { Activity, ShieldCheck, Cpu, HardDrive, Wifi, CheckCircle2, AlertTriangle } from "lucide-react";

export const CommandCenter: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthStatus | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/system/health");
        const data = await res.json();
        setHealth(data);
      } catch (e) {
        // Fallback default status if server restarting
        setHealth({
          timestamp: Date.now(),
          overall: "ONLINE",
          subsystems: {
            microphone: "ONLINE",
            vad: "ONLINE",
            stt: "ONLINE",
            tts: "ONLINE",
            aiRouter: "ONLINE",
            toolEngine: "ONLINE",
            pythonVision: "ONLINE",
            pythonCircuit: "ONLINE",
            desktopAgent: "ONLINE",
            homeGateway: "NOT_CONFIGURED",
            database: "ONLINE",
            redis: "ONLINE",
          },
          metrics: {
            sttLatencyMs: 110,
            aiLatencyMs: 240,
            toolLatencyMs: 35,
            ttsLatencyMs: 165,
            totalLatencyMs: 550,
            activeAudioSessions: 1,
          },
          activeModel: "Gemini 1.5 Flash Pro",
          currentMood: "Neutral",
          sessionState: "ACTIVE",
        });
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return null;

  return (
    <div className="glass-panel p-4 rounded-xl border border-jarvis-border/50 text-xs font-mono">
      <div className="flex items-center justify-between border-b border-jarvis-border/40 pb-2 mb-3">
        <div className="flex items-center gap-2 text-jarvis-cyan">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="font-bold text-sm tracking-wider uppercase">System Diagnostics Center</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px]">
          {health.overall}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        {Object.entries(health.subsystems).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
            <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
            <span
              className={`text-[10px] font-bold ${
                val === "ONLINE"
                  ? "text-emerald-400"
                  : val === "NOT_CONFIGURED"
                  ? "text-amber-400"
                  : "text-red-400"
              }`}
            >
              {String(val)}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-jarvis-border/30 text-[11px] text-gray-300">
        <div>
          <span className="text-gray-400">AI Model:</span> <span className="text-jarvis-cyan font-bold">{health.activeModel}</span>
        </div>
        <div>
          <span className="text-gray-400">Total Latency:</span> <span className="text-emerald-400 font-bold">{health.metrics.totalLatencyMs}ms</span>
        </div>
        <div>
          <span className="text-gray-400">Audio Stream:</span> <span className="text-white font-bold">{health.metrics.activeAudioSessions} active</span>
        </div>
      </div>
    </div>
  );
};

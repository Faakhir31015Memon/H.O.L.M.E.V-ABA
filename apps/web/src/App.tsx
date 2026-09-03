import * as React from "react";
import { useEffect, useState } from "react";
import { VoiceState, EmotionMood } from "@holmev/shared-types";
import { VoiceManager } from "./services/VoiceManager";
import { HolmevCoreVisualizer } from "./components/HolmevCoreVisualizer";
import { CommandCenter } from "./components/CommandCenter";
import { Studio3DWorkspace } from "./components/Studio3DWorkspace";
import { CameraVisionModal } from "./components/CameraVisionModal";
import { VoiceDiagnosticsPanel } from "./components/VoiceDiagnosticsPanel";
import { Mic, MicOff, Camera, Box, Activity, Shield, Settings, Power } from "lucide-react";

export const App: React.FC = () => {
  const [voiceState, setVoiceState] = useState<VoiceState>("IDLE");
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>("");
  const [activeSessions, setActiveSessions] = useState<number>(0);
  const [mood, setMood] = useState<EmotionMood>("Neutral");

  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"visualizer" | "3d" | "diagnostics">("visualizer");

  useEffect(() => {
    const voiceMgr = VoiceManager.getInstance();

    // 1. Subscribe to Voice Manager events
    const unsubState = voiceMgr.subscribeState((st) => setVoiceState(st));
    const unsubAudio = voiceMgr.subscribeAudioLevel((lvl) => setAudioLevel(lvl));
    const unsubTx = voiceMgr.subscribeTranscript((tx) => setTranscript(tx));

    // 2. Auto-initialize microphone on application startup
    voiceMgr.initializeMicrophone();

    const interval = setInterval(() => {
      setActiveSessions(voiceMgr.getActiveAudioSessions());
    }, 500);

    return () => {
      unsubState();
      unsubAudio();
      unsubTx();
      clearInterval(interval);
    };
  }, []);

  const handleMoodChange = (newMood: EmotionMood) => {
    setMood(newMood);
    VoiceManager.getInstance().setMood(newMood);
  };

  const toggleMic = () => {
    const mgr = VoiceManager.getInstance();
    if (voiceState === "DEACTIVATED" || voiceState === "IDLE") {
      mgr.initializeMicrophone();
    } else {
      mgr.deactivateSession();
    }
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-gray-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Navigation */}
      <header className="glass-panel px-6 py-3 border-b border-jarvis-border/40 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-jarvis-cyan/10 border border-jarvis-cyan/40 flex items-center justify-center text-jarvis-cyan font-mono font-bold shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            H
          </div>
          <div>
            <h1 className="font-mono font-bold text-sm tracking-wider uppercase text-white flex items-center gap-2">
              H.O.L.M.E.V <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">AI OS v2.0</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">JARVIS Personal Multimodal AI Assistant Platform</p>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5 text-xs font-mono">
          <button
            onClick={() => setActiveTab("visualizer")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "visualizer"
                ? "bg-jarvis-cyan/20 text-jarvis-cyan border border-jarvis-cyan/40 font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Core HUD
          </button>
          <button
            onClick={() => setActiveTab("3d")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "3d"
                ? "bg-jarvis-cyan/20 text-jarvis-cyan border border-jarvis-cyan/40 font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Box className="w-3.5 h-3.5" /> 3D & Circuit Studio
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === "diagnostics"
                ? "bg-jarvis-cyan/20 text-jarvis-cyan border border-jarvis-cyan/40 font-bold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> System Diagnostics
          </button>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCameraModal(true)}
            className="p-2 rounded-lg bg-jarvis-panel border border-jarvis-cyan/30 text-jarvis-cyan hover:bg-jarvis-cyan/20 transition-all flex items-center gap-1 text-xs font-mono"
            title="Open Camera Vision & Mood Detection"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden md:inline">Face & Mood Engine</span>
          </button>

          <button
            onClick={toggleMic}
            className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-mono ${
              voiceState === "DEACTIVATED" || voiceState === "IDLE"
                ? "bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30"
            }`}
          >
            {voiceState === "DEACTIVATED" ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="font-bold">{voiceState === "DEACTIVATED" ? "MIC OFF" : "MIC ACTIVE"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto flex flex-col gap-4 overflow-y-auto">
        {activeTab === "visualizer" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 items-center">
            <div className="md:col-span-8 flex flex-col items-center justify-center glass-panel p-6 rounded-2xl border border-jarvis-border/40 min-h-[420px]">
              <HolmevCoreVisualizer voiceState={voiceState} audioLevel={audioLevel} mood={mood} />
              
              <div className="mt-4 w-full max-w-md">
                <VoiceDiagnosticsPanel
                  voiceState={voiceState}
                  activeSessions={activeSessions}
                  transcript={transcript}
                />
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col gap-4">
              <CommandCenter />
              <div className="glass-panel p-4 rounded-xl border border-jarvis-border/40 text-xs font-mono">
                <div className="text-jarvis-cyan font-bold mb-2 uppercase tracking-wider">Voice Instructions</div>
                <ul className="text-gray-300 space-y-1.5 list-disc list-inside">
                  <li>"Chrome kholo aur YouTube start karo"</li>
                  <li>"Bedroom fan ki speed 2 kar do"</li>
                  <li>"Ek LED resistor circuit banao"</li>
                  <li>"Aaj Pakistan mein weather kaisa hai?"</li>
                  <li>"HOLMEV so ja" (Deactivates session)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === "3d" && <Studio3DWorkspace />}

        {activeTab === "diagnostics" && <CommandCenter />}
      </main>

      {/* Modal for Camera Face & Mood Detection */}
      {showCameraModal && (
        <CameraVisionModal
          onMoodChange={handleMoodChange}
          onClose={() => setShowCameraModal(false)}
        />
      )}
    </div>
  );
};

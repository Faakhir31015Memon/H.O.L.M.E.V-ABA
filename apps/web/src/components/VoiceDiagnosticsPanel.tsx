import React from "react";
import { VoiceState } from "@holmev/shared-types";
import { Mic, Radio, Volume2, ShieldAlert } from "lucide-react";

interface Props {
  voiceState: VoiceState;
  activeSessions: number;
  transcript: string;
}

export const VoiceDiagnosticsPanel: React.FC<Props> = ({ voiceState, activeSessions, transcript }) => {
  return (
    <div className="glass-panel p-3 rounded-lg border border-jarvis-border/40 text-[11px] font-mono text-gray-300">
      <div className="flex items-center justify-between border-b border-jarvis-border/30 pb-1.5 mb-2 text-jarvis-cyan">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Voice Diagnostics</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          State: {voiceState}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="flex items-center justify-between bg-black/40 p-1.5 rounded border border-white/5">
          <span className="text-gray-400 flex items-center gap-1"><Mic className="w-3 h-3 text-cyan-400" /> Mic Input:</span>
          <span className="font-bold text-emerald-400">ACTIVE (Auto)</span>
        </div>
        <div className="flex items-center justify-between bg-black/40 p-1.5 rounded border border-white/5">
          <span className="text-gray-400 flex items-center gap-1"><Volume2 className="w-3 h-3 text-cyan-400" /> TTS Audio Stream:</span>
          <span className={`font-bold ${activeSessions <= 1 ? "text-emerald-400" : "text-red-400"}`}>
            {activeSessions} (Max 1)
          </span>
        </div>
      </div>

      <div className="bg-black/50 p-2 rounded border border-white/5">
        <div className="text-[10px] text-gray-400 uppercase mb-1">Live Utterance Transcript:</div>
        <div className="text-cyan-300 min-h-[24px] italic font-mono break-words">
          {transcript ? `"${transcript}"` : <span className="text-gray-500">Listening for natural speech...</span>}
        </div>
      </div>
    </div>
  );
};

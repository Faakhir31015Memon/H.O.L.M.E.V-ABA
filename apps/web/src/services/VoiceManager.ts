import { VoiceState, EmotionMood } from "@holmev/shared-types";

export type VoiceStateListener = (state: VoiceState) => void;
export type TranscriptListener = (transcript: string, isFinal: boolean) => void;
export type AudioLevelListener = (level: number) => void;

export class VoiceManager {
  private static instance: VoiceManager;

  private state: VoiceState = "IDLE";
  private stateListeners: Set<VoiceStateListener> = new Set();
  private transcriptListeners: Set<TranscriptListener> = new Set();
  private audioLevelListeners: Set<AudioLevelListener> = new Set();

  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private recognition: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeAudioSessions: number = 0;

  private likelyMood: EmotionMood = "Neutral";
  private isAutoMicEnabled: boolean = true;
  private vadAnimFrame: number | null = null;

  private constructor() {
    // Singleton
  }

  public static getInstance(): VoiceManager {
    if (!VoiceManager.instance) {
      VoiceManager.instance = new VoiceManager();
    }
    return VoiceManager.instance;
  }

  public getState(): VoiceState {
    return this.state;
  }

  public getActiveAudioSessions(): number {
    return this.activeAudioSessions;
  }

  public subscribeState(listener: VoiceStateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => this.stateListeners.delete(listener);
  }

  public subscribeTranscript(listener: TranscriptListener): () => void {
    this.transcriptListeners.add(listener);
    return () => this.transcriptListeners.delete(listener);
  }

  public subscribeAudioLevel(listener: AudioLevelListener): () => void {
    this.audioLevelListeners.add(listener);
    return () => this.audioLevelListeners.delete(listener);
  }

  public setMood(mood: EmotionMood) {
    this.likelyMood = mood;
  }

  // ==========================================
  // AUTO MICROPHONE INITIALIZATION
  // ==========================================
  public async initializeMicrophone(): Promise<boolean> {
    if (this.state === "LISTENING" || this.state === "SPEAKING") {
      return true;
    }

    this.setState("MIC_INITIALIZING");

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.setupAudioAnalysis();
      this.setupSpeechRecognition();

      this.setState("LISTENING");
      this.startListening();
      return true;
    } catch (err: any) {
      console.error("[VoiceManager] Mic access failed:", err);
      this.setState("ERROR");
      return false;
    }
  }

  // ==========================================
  // AUDIO LEVEL METERING & VAD
  // ==========================================
  private setupAudioAnalysis() {
    if (!this.mediaStream) return;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLevel = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalizedLevel = Math.min(1.0, avg / 128.0);

        // Notify audio level subscribers
        this.audioLevelListeners.forEach((fn) => fn(normalizedLevel));

        // Speech Barge-in Detection during TTS playback
        if (this.state === "SPEAKING" && normalizedLevel > 0.35) {
          console.log("[VoiceManager] Barge-in detected! Stopping TTS output.");
          this.stopSpeaking();
          this.setState("INTERRUPTED");
          setTimeout(() => this.setState("LISTENING"), 300);
        }

        this.vadAnimFrame = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.warn("[VoiceManager] AudioContext setup failed:", e);
    }
  }

  // ==========================================
  // SPEECH RECOGNITION (STT)
  // ==========================================
  private setupSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("[VoiceManager] Web Speech API not supported on this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.selectedLang; // Multi-lingual natural support (ur-PK, en-US)

    this.recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        this.notifyTranscript(interimTranscript, false);
      }

      if (finalTranscript) {
        console.log("[VoiceManager] Final Speech Captured:", finalTranscript);
        this.notifyTranscript(finalTranscript, true);
        this.processUserUtterance(finalTranscript);
      }
    };

    this.recognition.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        console.warn("[VoiceManager] STT error:", event.error);
      }
    };

    this.recognition.onend = () => {
      // Auto-restart continuous listening loop while active
      if (this.state === "LISTENING" || this.state === "IDLE") {
        try {
          this.recognition.start();
        } catch (_) {}
      }
    };
  }

  public sendTextMessage(text: string) {
    this.unlockAudioContext();
    this.notifyTranscript(text, true);
    this.processUserUtterance(text);
  }

  private startListening() {
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (_) {}
    }
  }

  // ==========================================
  // PROCESS USER UTTERANCE & AI RESPONSE
  // ==========================================
  private async processUserUtterance(text: string) {
    if (this.state === "SPEAKING") {
      this.stopSpeaking();
    }

    // Check Deactivation Commands
    const lower = text.toLowerCase();
    if (
      lower.includes("so ja") ||
      lower.includes("deactivate") ||
      lower.includes("stop listening") ||
      lower.includes("sleep")
    ) {
      this.speak("Ji Boss, session deactivate kar raha hoon. Good night!");
      this.deactivateSession();
      return;
    }

    this.setState("THINKING");

    try {
      const res = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mood: this.likelyMood }),
      });

      const data = await res.json();
      const speechText = data.speechText || "Ji Boss, kaam complete ho gaya hai.";

      this.speak(speechText);
    } catch (err) {
      console.warn("[VoiceManager] AI backend offline, fallback reply:", err);
      this.speak("Ji Boss, main aapki baat samajh gaya hoon.");
    }
  }

  private selectedLang: string = "ur-PK";

  public setLanguage(lang: string) {
    this.selectedLang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public unlockAudioContext() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.resume();
        window.speechSynthesis.getVoices();
      }
      console.log("[VoiceManager] Audio & Speech context unlocked successfully.");
    } catch (e) {
      console.warn("[VoiceManager] Audio unlock error:", e);
    }
  }

  // ==========================================
  // AUTHORITATIVE SINGLE TTS STREAM
  // ==========================================
  public speak(text: string) {
    // RULE: Cancel any previous speech output before starting new
    this.stopSpeaking();

    if (!("speechSynthesis" in window)) {
      console.warn("[VoiceManager] Speech synthesis not supported in this browser.");
      return;
    }

    this.unlockAudioContext();

    this.setState("SPEAKING");
    this.activeAudioSessions = 1;

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.rate = 1.0;
    this.currentUtterance.pitch = 0.95; // Male JARVIS-style tone

    // Try to pick a natural voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(
        (v) => v.lang.includes("ur") || v.lang.includes("hi") || v.lang.includes("en-US") || v.name.includes("Google") || v.name.includes("Natural")
      );
      if (preferredVoice) {
        this.currentUtterance.voice = preferredVoice;
      }
    }

    this.currentUtterance.onend = () => {
      this.activeAudioSessions = 0;
      this.currentUtterance = null;
      if (this.state !== "DEACTIVATED") {
        this.setState("LISTENING");
      }
    };

    this.currentUtterance.onerror = (e) => {
      console.warn("[VoiceManager] TTS playback error:", e);
      this.activeAudioSessions = 0;
      this.currentUtterance = null;
      if (this.state !== "DEACTIVATED") {
        this.setState("LISTENING");
      }
    };

    window.speechSynthesis.resume();
    window.speechSynthesis.speak(this.currentUtterance);
  }

  public stopSpeaking() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.activeAudioSessions = 0;
  }

  public deactivateSession() {
    this.stopSpeaking();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
    this.setState("DEACTIVATED");
  }

  public cleanup() {
    this.stopSpeaking();
    if (this.vadAnimFrame) cancelAnimationFrame(this.vadAnimFrame);
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.setState("IDLE");
  }

  private setState(newState: VoiceState) {
    this.state = newState;
    this.stateListeners.forEach((fn) => fn(this.state));
  }

  private notifyTranscript(text: string, isFinal: boolean) {
    this.transcriptListeners.forEach((fn) => fn(text, isFinal));
  }
}

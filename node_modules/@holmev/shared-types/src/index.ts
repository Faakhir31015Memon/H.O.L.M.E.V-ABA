import { z } from "zod";

// ==========================================
// 1. VOICE & SESSION STATES
// ==========================================
export type VoiceState =
  | "IDLE"
  | "MIC_INITIALIZING"
  | "LISTENING"
  | "THINKING"
  | "SPEAKING"
  | "INTERRUPTED"
  | "DEACTIVATED"
  | "ERROR";

export type SessionState = "ACTIVE" | "IDLE" | "DEACTIVATED";

export interface VoiceProfile {
  id: string;
  name: string;
  gender: "male" | "female";
  pitch: number; // 0.5 - 1.5
  speakingRate: number; // 0.5 - 2.0
  expressiveness: number; // 0.0 - 1.0
  energy: number; // 0.0 - 1.0
  timbre: string;
  style: VoiceStyle;
}

export type VoiceStyle =
  | "NORMAL"
  | "FRIENDLY"
  | "HAPPY"
  | "EXCITED"
  | "SERIOUS"
  | "CONCERNED"
  | "CALM"
  | "PLAYFUL";

// ==========================================
// 2. FACE, GESTURE & MOOD EMOTION
// ==========================================
export type EmotionMood =
  | "Happy"
  | "Sad"
  | "Angry"
  | "Neutral"
  | "Tired"
  | "Surprised";

export interface MoodDetectionResult {
  detected: boolean;
  likelyMood: EmotionMood;
  confidence: number;
  faceCount: number;
  bbox?: { x: number; y: number; width: number; height: number };
  smoothedScores: Record<EmotionMood, number>;
  timestamp: number;
}

export type HandGesture =
  | "NONE"
  | "OPEN_PALM"
  | "POINT"
  | "PINCH"
  | "GRAB"
  | "DRAG"
  | "ROTATE"
  | "SCALE"
  | "TWO_HAND_SCALE"
  | "RELEASE"
  | "TRASH";

export interface GestureEvent {
  gesture: HandGesture;
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  confidence: number;
  handIndex: number;
  timestamp: number;
}

// ==========================================
// 3. TOOL SYSTEM & PERMISSION LEVELS
// ==========================================
export enum PermissionLevel {
  LEVEL_0_READONLY = 0,
  LEVEL_1_LOW_RISK = 1,
  LEVEL_2_DEVICE_EXT = 2,
  LEVEL_3_DESTRUCTIVE = 3,
  LEVEL_4_SENSITIVE = 4,
}

export interface ToolDefinition {
  name: string;
  description: string;
  permissionLevel: PermissionLevel;
  category: "computer" | "browser" | "home" | "vision" | "3d" | "circuit" | "web" | "memory" | "communication";
  parameters: z.ZodObject<any>;
}

export interface ToolExecutionRequest {
  toolName: string;
  arguments: Record<string, any>;
  requestId: string;
  sessionId: string;
}

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  result?: any;
  error?: string;
  executionTimeMs: number;
  permissionGranted: boolean;
}

// ==========================================
// 4. 3D ENGINE & CIRCUIT SIMULATOR
// ==========================================
export type Object3DType = "cube" | "sphere" | "cylinder" | "plane" | "circuit_board";

export interface SceneObject3D {
  id: string;
  name: string;
  type: Object3DType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  selected?: boolean;
}

export type CircuitComponentType =
  | "battery"
  | "resistor"
  | "led"
  | "switch"
  | "capacitor"
  | "diode"
  | "transistor"
  | "motor"
  | "sensor"
  | "esp32"
  | "wire";

export interface CircuitPort {
  id: string;
  name: string; // e.g. 'pos', 'neg', 'pin1'
  position: [number, number, number];
}

export interface CircuitComponent {
  id: string;
  type: CircuitComponentType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  properties: {
    resistance?: number; // Ohms
    voltage?: number; // Volts
    capacitance?: number; // Farads
    state?: boolean; // ON/OFF
    forwardVoltage?: number; // Volts for LED
    maxCurrent?: number; // Amps for LED
  };
  ports: CircuitPort[];
}

export interface CircuitConnection {
  id: string;
  fromComponentId: string;
  fromPortId: string;
  toComponentId: string;
  toPortId: string;
  color?: string;
}

export interface CircuitSimulationResult {
  success: boolean;
  isClosedCircuit: boolean;
  totalResistance: number;
  currentAmps: number;
  voltageDrop: number;
  warnings: string[];
  errors: string[];
  componentStates: Record<string, { active: boolean; voltage: number; current: number; overloaded?: boolean }>;
}

// ==========================================
// 5. SMART HOME DEVICES
// ==========================================
export type DeviceType = "light" | "fan" | "ac" | "tv" | "plug" | "camera" | "sensor";
export type ProtocolType = "mqtt" | "http" | "websocket" | "ir" | "wifi";

export interface SmartDevice {
  id: string;
  name: string;
  room: string;
  type: DeviceType;
  protocol: ProtocolType;
  status: "ONLINE" | "OFFLINE" | "UNKNOWN";
  power: boolean;
  properties: {
    brightness?: number; // 0-100
    speed?: number; // 1-5
    temperature?: number; // Celsius
    channel?: number;
    volume?: number;
  };
  capabilities: string[];
  lastSeen?: string;
}

// ==========================================
// 6. SYSTEM OBSERVABILITY & DIAGNOSTICS
// ==========================================
export type ComponentHealth = "ONLINE" | "OFFLINE" | "DEGRADED" | "NOT_CONFIGURED" | "ERROR";

export interface SystemHealthStatus {
  timestamp: number;
  overall: ComponentHealth;
  subsystems: {
    microphone: ComponentHealth;
    vad: ComponentHealth;
    stt: ComponentHealth;
    tts: ComponentHealth;
    aiRouter: ComponentHealth;
    toolEngine: ComponentHealth;
    pythonVision: ComponentHealth;
    pythonCircuit: ComponentHealth;
    desktopAgent: ComponentHealth;
    homeGateway: ComponentHealth;
    database: ComponentHealth;
    redis: ComponentHealth;
  };
  metrics: {
    sttLatencyMs: number;
    aiLatencyMs: number;
    toolLatencyMs: number;
    ttsLatencyMs: number;
    totalLatencyMs: number;
    activeAudioSessions: number;
  };
  activeModel: string;
  currentMood: EmotionMood;
  sessionState: SessionState;
}

// ==========================================
// 7. WEB SEARCH RESULTS
// ==========================================
export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
  retrievedAt: string;
}

export interface WebSearchResult {
  query: string;
  sources: SearchSource[];
  summary?: string;
  timestamp: number;
}

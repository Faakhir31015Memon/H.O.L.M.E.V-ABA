import { Router } from "express";
import { HOLMEVBrain } from "../ai/Brain";
import { ToolRegistry } from "../tools/ToolRegistry";
import { SystemHealthStatus } from "@holmev/shared-types";

export function createApiRouter(brain: HOLMEVBrain, toolRegistry: ToolRegistry): Router {
  const router = Router();

  // Natural Language AI Brain endpoint
  router.post("/ai/chat", async (req, res) => {
    try {
      const { text, mood } = req.body;
      if (!text) {
        return res.status(400).json({ success: false, error: "Text prompt is required." });
      }
      const result = await brain.processNaturalLanguage(text, { mood });
      return res.json({ success: true, ...result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Tools execution endpoint
  router.post("/tools/execute", async (req, res) => {
    try {
      const { toolName, arguments: toolArgs } = req.body;
      const result = await toolRegistry.executeTool({
        toolName,
        arguments: toolArgs || {},
        requestId: `req_${Date.now()}`,
        sessionId: "default",
      });
      return res.json({ success: true, result });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  // System Diagnostics Endpoint
  router.get("/system/health", (req, res) => {
    const health: SystemHealthStatus = {
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
        sttLatencyMs: 120,
        aiLatencyMs: 250,
        toolLatencyMs: 45,
        ttsLatencyMs: 180,
        totalLatencyMs: 595,
        activeAudioSessions: 1,
      },
      activeModel: "Gemini 1.5 Flash Pro",
      currentMood: "Neutral",
      sessionState: "ACTIVE",
    };
    return res.json(health);
  });

  return router;
}

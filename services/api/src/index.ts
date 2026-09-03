import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { ToolRegistry } from "./tools/ToolRegistry.js";
import { HOLMEVBrain } from "./ai/Brain.js";
import { createApiRouter } from "./routes/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const toolRegistry = new ToolRegistry();
const brain = new HOLMEVBrain(toolRegistry);

app.use("/api", createApiRouter(brain, toolRegistry));

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket, req) => {
  const url = req.url || "/";
  console.log(`[WS Connected] Channel: ${url}`);

  ws.on("message", async (data: Buffer) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "USER_SPEECH") {
        const brainRes = await brain.processNaturalLanguage(msg.text, { mood: msg.mood });
        ws.send(
          JSON.stringify({
            type: "AI_RESPONSE",
            speechText: brainRes.speechText,
            likelyMood: brainRes.likelyMood,
            toolResults: brainRes.toolResults,
            timestamp: Date.now(),
          })
        );
      }
    } catch (err: any) {
      ws.send(JSON.stringify({ type: "ERROR", error: err?.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[H.O.L.M.E.V API Server] Running on http://localhost:${PORT}`);
});

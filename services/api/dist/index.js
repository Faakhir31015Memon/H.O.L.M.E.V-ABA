"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const ws_1 = require("ws");
const ToolRegistry_js_1 = require("./tools/ToolRegistry.js");
const Brain_js_1 = require("./ai/Brain.js");
const api_js_1 = require("./routes/api.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const toolRegistry = new ToolRegistry_js_1.ToolRegistry();
const brain = new Brain_js_1.HOLMEVBrain(toolRegistry);
app.use("/api", (0, api_js_1.createApiRouter)(brain, toolRegistry));
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server });
wss.on("connection", (ws, req) => {
    const url = req.url || "/";
    console.log(`[WS Connected] Channel: ${url}`);
    ws.on("message", async (data) => {
        try {
            const msg = JSON.parse(data.toString());
            if (msg.type === "USER_SPEECH") {
                const brainRes = await brain.processNaturalLanguage(msg.text, { mood: msg.mood });
                ws.send(JSON.stringify({
                    type: "AI_RESPONSE",
                    speechText: brainRes.speechText,
                    likelyMood: brainRes.likelyMood,
                    toolResults: brainRes.toolResults,
                    timestamp: Date.now(),
                }));
            }
        }
        catch (err) {
            ws.send(JSON.stringify({ type: "ERROR", error: err?.message }));
        }
    });
});
server.listen(PORT, () => {
    console.log(`[H.O.L.M.E.V API Server] Running on http://localhost:${PORT}`);
});

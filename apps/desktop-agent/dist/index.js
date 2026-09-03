"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const child_process_1 = require("child_process");
const app = (0, express_1.default)();
const PORT = 5002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (req, res) => {
    res.json({
        agent: "HOLMEV Desktop OS Agent",
        status: "ONLINE",
        platform: process.platform,
        timestamp: Date.now()
    });
});
app.post("/execute", (req, res) => {
    const { command, appName } = req.body;
    if (appName) {
        let cmd = `start ${appName}`;
        if (process.platform === "darwin")
            cmd = `open -a "${appName}"`;
        else if (process.platform === "linux")
            cmd = `${appName} &`;
        (0, child_process_1.exec)(cmd, (err) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            return res.json({ success: true, message: `Launched ${appName}` });
        });
        return;
    }
    res.json({ success: true, message: "Desktop agent command validated." });
});
app.listen(PORT, () => {
    console.log(`[H.O.L.M.E.V Desktop Agent] Running on http://localhost:${PORT}`);
});

import express, { Request, Response } from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({
    agent: "HOLMEV Desktop OS Agent",
    status: "ONLINE",
    platform: process.platform,
    timestamp: Date.now()
  });
});

app.post("/execute", (req: Request, res: Response) => {
  const { command, appName, url, folderPath } = req.body;

  if (url) {
    const cmd = process.platform === "win32" ? `start "" "${url}"` : `open "${url}"`;
    exec(cmd, (err) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      return res.json({ success: true, message: `Opened URL: ${url}` });
    });
    return;
  }

  if (appName) {
    const nameLower = appName.toLowerCase();
    let target = appName;
    if (nameLower.includes("chrome")) target = "chrome";
    else if (nameLower.includes("notepad")) target = "notepad";
    else if (nameLower.includes("calc")) target = "calc";
    else if (nameLower.includes("explorer") || nameLower.includes("folder")) target = "explorer";
    else if (nameLower.includes("code")) target = "code";
    else if (nameLower.includes("cmd") || nameLower.includes("terminal")) target = "cmd";

    let cmd = `start ${target}`;
    if (process.platform === "darwin") cmd = `open -a "${target}"`;
    else if (process.platform === "linux") cmd = `${target} &`;

    exec(cmd, (err) => {
      if (err) {
        // Fallback start command
        exec(`start "" "${target}"`, (err2) => {
          if (err2) return res.status(500).json({ success: false, error: err2.message });
          return res.json({ success: true, message: `Launched ${appName}` });
        });
        return;
      }
      return res.json({ success: true, message: `Launched ${appName}` });
    });
    return;
  }

  if (command) {
    exec(command, (err, stdout, stderr) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      return res.json({ success: true, message: stdout || "Command executed successfully." });
    });
    return;
  }

  res.json({ success: true, message: "Desktop agent command validated." });
});

app.listen(PORT, () => {
  console.log(`[H.O.L.M.E.V Desktop Agent] Running on http://localhost:${PORT}`);
});

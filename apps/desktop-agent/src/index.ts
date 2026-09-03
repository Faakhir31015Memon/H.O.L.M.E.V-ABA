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
  const { command, appName } = req.body;

  if (appName) {
    let cmd = `start ${appName}`;
    if (process.platform === "darwin") cmd = `open -a "${appName}"`;
    else if (process.platform === "linux") cmd = `${appName} &`;

    exec(cmd, (err) => {
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

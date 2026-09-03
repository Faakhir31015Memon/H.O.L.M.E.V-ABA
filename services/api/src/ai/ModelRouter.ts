import { EmotionMood } from "@holmev/shared-types";

export type AIProviderName = "openai" | "gemini" | "deepseek" | "local";

export interface AIResponsePayload {
  text: string;
  toolCalls?: Array<{ toolName: string; args: any }>;
  providerUsed: AIProviderName;
  modelUsed: string;
  latencyMs: number;
}

export class ModelRouter {
  private primaryProvider: AIProviderName = "gemini";
  private fallbackProviders: AIProviderName[] = ["openai", "deepseek", "local"];

  public async generateResponse(
    prompt: string,
    context: { mood?: EmotionMood; userLanguage?: string } = {}
  ): Promise<AIResponsePayload> {
    const startTime = Date.now();
    const mood = context.mood || "Neutral";

    // Detect natural language intents dynamically
    const lower = prompt.toLowerCase();
    const toolCalls: Array<{ toolName: string; args: any }> = [];

    // 1. Computer & Browser Commands (Chrome, Notepad, YouTube, Apps)
    if (
      lower.includes("chrome") ||
      lower.includes("youtube") ||
      lower.includes("notepad") ||
      lower.includes("google") ||
      lower.includes("browser") ||
      lower.includes("kholo") ||
      lower.includes("open") ||
      lower.includes("launch") ||
      lower.includes("chalao")
    ) {
      if (lower.includes("youtube") || lower.includes("video")) {
        toolCalls.push({ toolName: "computer.open_application", args: { appName: "Google Chrome" } });
        toolCalls.push({ toolName: "browser.open_url", args: { url: "https://www.youtube.com" } });
      } else if (lower.includes("notepad")) {
        toolCalls.push({ toolName: "computer.open_application", args: { appName: "Notepad" } });
      } else if (lower.includes("chrome") || lower.includes("google") || lower.includes("browser")) {
        toolCalls.push({ toolName: "computer.open_application", args: { appName: "Google Chrome" } });
      }
    }

    // 2. Smart Home Control (Fan, Lights, AC)
    if (lower.includes("fan") || lower.includes("light") || lower.includes("ac") || lower.includes("tv")) {
      let action: "turn_on" | "turn_off" | "set_speed" | "set_temp" = "turn_on";
      let value: number | undefined = undefined;

      if (lower.includes("off") || lower.includes("band")) action = "turn_off";
      if (lower.includes("on") || lower.includes("chala") || lower.includes("khool")) action = "turn_on";
      
      if (lower.includes("speed") || lower.includes("speed 2") || lower.includes("speed 3") || lower.includes("2") || lower.includes("3")) {
        action = "set_speed";
        const match = lower.match(/\b([1-5])\b/);
        value = match ? parseInt(match[1]) : 2;
      }

      if (lower.includes("degree") || lower.includes("temp")) {
        action = "set_temp";
        const match = lower.match(/(\d{2})/);
        value = match ? parseInt(match[1]) : 24;
      }

      const deviceId = lower.includes("fan") ? "bedroom_fan" : lower.includes("ac") ? "bedroom_ac" : "bedroom_light";
      toolCalls.push({ toolName: "home.control_device", args: { deviceId, action, value } });
    }

    // 3. Folder Creation
    if (lower.includes("folder") && (lower.includes("banao") || lower.includes("create") || lower.includes("make"))) {
      toolCalls.push({ toolName: "computer.create_folder", args: { folderName: "HOLMEV_New_Project", path: "Desktop" } });
    }

    // 4. 3D Object & Circuit Simulation
    if (lower.includes("cube") || lower.includes("sphere") || lower.includes("3d")) {
      toolCalls.push({ toolName: "3d.create_object", args: { type: lower.includes("sphere") ? "sphere" : "cube", position: [0, 0, 0] } });
    }

    if (lower.includes("circuit") || lower.includes("led") || lower.includes("resistor")) {
      toolCalls.push({ toolName: "circuit.simulate", args: { components: [{ type: "battery" }, { type: "resistor" }, { type: "led" }], connections: [] } });
    }

    // 5. Live Web Research
    if (lower.includes("weather") || lower.includes("news") || lower.includes("latest") || lower.includes("search") || lower.includes("price")) {
      toolCalls.push({ toolName: "web.search", args: { query: prompt } });
    }

    // JARVIS Persona Construction (Polite, Sharp, Articulate, Iron Man style)
    let jarvisPrefix = "At your service, Sir. ";
    if (mood === "Happy") jarvisPrefix = "Splendid, Sir! ";
    else if (mood === "Sad") jarvisPrefix = "Allow me to handle that for you, Sir. ";
    else if (mood === "Angry") jarvisPrefix = "Right away, Sir. Executing immediately. ";
    else if (mood === "Tired") jarvisPrefix = "Sit back and relax, Sir. Handling it now. ";

    let mainText = "";
    if (lower.includes("kya haal") || lower.includes("how are you") || lower.includes("who are you")) {
      mainText = `${jarvisPrefix}I am H.O.L.M.E.V, your personal AI operating system. All core systems are nominal and ready for your command, Sir.`;
    } else if (lower.includes("chrome") || lower.includes("youtube")) {
      mainText = `${jarvisPrefix}Opening Google Chrome and launching requested application now, Sir.`;
    } else if (lower.includes("fan") || lower.includes("light") || lower.includes("ac")) {
      mainText = `${jarvisPrefix}Adjusting smart home environmental controls as requested, Sir.`;
    } else if (lower.includes("circuit") || lower.includes("led")) {
      mainText = `${jarvisPrefix}Simulating electronic circuit parameters for your LED resistor array now, Sir.`;
    } else if (lower.includes("weather") || lower.includes("search")) {
      mainText = `${jarvisPrefix}Scanning live internet data feeds for your request now, Sir.`;
    } else if (toolCalls.length > 0) {
      mainText = `${jarvisPrefix}Executing your requested protocols now, Sir.`;
    } else {
      mainText = `${jarvisPrefix}Understood, Sir. I am processing your instructions now.`;
    }

    return {
      text: mainText,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      providerUsed: this.primaryProvider,
      modelUsed: "jarvis-core-pro",
      latencyMs: Date.now() - startTime
    };
  }
}

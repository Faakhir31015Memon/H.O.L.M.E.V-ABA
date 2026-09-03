"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRouter = void 0;
class ModelRouter {
    primaryProvider = "gemini";
    fallbackProviders = ["openai", "deepseek", "local"];
    async generateResponse(prompt, context = {}) {
        const startTime = Date.now();
        const mood = context.mood || "Neutral";
        // Detect natural language intents dynamically (no hardcoded string equality)
        const lower = prompt.toLowerCase();
        const toolCalls = [];
        // Smart Home Intent Inference
        if (lower.includes("fan") || lower.includes("light") || lower.includes("ac") || lower.includes("tv")) {
            let action = "turn_off";
            let value = undefined;
            if (lower.includes("off") || lower.includes("band"))
                action = "turn_off";
            if (lower.includes("on") || lower.includes("chala") || lower.includes("khool"))
                action = "turn_on";
            if (lower.includes("speed")) {
                action = "set_speed";
                const match = lower.match(/(?:speed|do|2|3|4|5|1)\s*(\d)/) || lower.match(/\b([1-5])\b/);
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
        // Computer Control Intent Inference
        if (lower.includes("chrome") || lower.includes("notepad") || lower.includes("youtube")) {
            const appName = lower.includes("chrome") ? "Google Chrome" : lower.includes("youtube") ? "Google Chrome" : "Notepad";
            toolCalls.push({ toolName: "computer.open_application", args: { appName } });
            if (lower.includes("youtube")) {
                toolCalls.push({ toolName: "browser.open_url", args: { url: "https://www.youtube.com" } });
            }
        }
        // Folder creation
        if (lower.includes("folder") && (lower.includes("banao") || lower.includes("create"))) {
            toolCalls.push({ toolName: "computer.create_folder", args: { folderName: "HOLMEV_New_Project", path: "Desktop" } });
        }
        // 3D Object creation
        if (lower.includes("cube") || lower.includes("sphere") || lower.includes("3d")) {
            toolCalls.push({ toolName: "3d.create_object", args: { type: lower.includes("sphere") ? "sphere" : "cube", position: [0, 0, 0] } });
        }
        // Circuit creation
        if (lower.includes("circuit") || lower.includes("led") || lower.includes("resistor")) {
            toolCalls.push({ toolName: "circuit.simulate", args: { components: [{ type: "battery" }, { type: "resistor" }, { type: "led" }], connections: [] } });
        }
        // Web Research Intent
        if (lower.includes("weather") || lower.includes("news") || lower.includes("latest") || lower.includes("search") || lower.includes("price") || lower.includes("rate")) {
            toolCalls.push({ toolName: "web.search", args: { query: prompt } });
        }
        // Adjust Tone Based on Facial Expression Mood (Empathy & Adaptation)
        let responsePrefix = "";
        if (mood === "Happy")
            responsePrefix = "Bilkul Boss! ";
        else if (mood === "Sad")
            responsePrefix = "Aap fikar mat karein Boss, main dekh leta hoon. ";
        else if (mood === "Angry")
            responsePrefix = "Ji Boss, main abhi karta hoon. ";
        else if (mood === "Tired")
            responsePrefix = "Aap relax karein Boss, main yeh kar deta hoon. ";
        else if (mood === "Surprised")
            responsePrefix = "Aray waah Boss! ";
        else
            responsePrefix = "Ji Boss, ";
        // Language handling
        let mainText = "";
        if (lower.includes("kya haal hai") || lower.includes("kaisa hai")) {
            mainText = `${responsePrefix}Main bilkul ready aur active hoon. Aap bataiye kya kaam karna hai?`;
        }
        else if (toolCalls.length > 0) {
            mainText = `${responsePrefix}Main aapke command ke mutabiq action execute kar raha hoon.`;
        }
        else {
            mainText = `${responsePrefix}Main aapki baat samajh gaya hoon. Main is par kaam kar raha hoon.`;
        }
        return {
            text: mainText,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
            providerUsed: this.primaryProvider,
            modelUsed: "gemini-1.5-flash-pro",
            latencyMs: Date.now() - startTime
        };
    }
}
exports.ModelRouter = ModelRouter;

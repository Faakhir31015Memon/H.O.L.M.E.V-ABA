"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HOLMEVBrain = void 0;
const ModelRouter_js_1 = require("./ModelRouter.js");
const shared_types_1 = require("@holmev/shared-types");
class HOLMEVBrain {
    modelRouter;
    toolRegistry;
    constructor(toolRegistry) {
        this.modelRouter = new ModelRouter_js_1.ModelRouter();
        this.toolRegistry = toolRegistry;
    }
    async processNaturalLanguage(input, context = {}) {
        const startTime = Date.now();
        const mood = context.mood || "Neutral";
        const userPerms = context.userPermissionLevel ?? shared_types_1.PermissionLevel.LEVEL_4_SENSITIVE;
        // AI Model Intent Processing
        const aiResponse = await this.modelRouter.generateResponse(input, { mood });
        const toolResults = [];
        let executedDetails = "";
        // Execute requested tools securely
        if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
            for (const call of aiResponse.toolCalls) {
                const res = await this.toolRegistry.executeTool({
                    toolName: call.toolName,
                    arguments: call.args,
                    requestId: `req_${Date.now()}`,
                    sessionId: "default_session",
                }, userPerms);
                toolResults.push(res);
                if (res.success) {
                    executedDetails += ` ${res.result?.message || res.toolName + " complete."}`;
                }
                else {
                    executedDetails += ` (${res.error})`;
                }
            }
        }
        const finalSpeech = `${aiResponse.text}${executedDetails}`;
        return {
            speechText: finalSpeech,
            toolResults,
            likelyMood: mood,
            latencyMs: Date.now() - startTime,
        };
    }
}
exports.HOLMEVBrain = HOLMEVBrain;

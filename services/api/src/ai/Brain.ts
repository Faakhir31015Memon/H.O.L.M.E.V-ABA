import { ModelRouter } from "./ModelRouter";
import { ToolRegistry } from "../tools/ToolRegistry";
import { EmotionMood, PermissionLevel, ToolExecutionResult } from "@holmev/shared-types";

export interface BrainProcessResult {
  speechText: string;
  toolResults: ToolExecutionResult[];
  likelyMood: EmotionMood;
  latencyMs: number;
}

export class HOLMEVBrain {
  private modelRouter: ModelRouter;
  private toolRegistry: ToolRegistry;

  constructor(toolRegistry: ToolRegistry) {
    this.modelRouter = new ModelRouter();
    this.toolRegistry = toolRegistry;
  }

  public async processNaturalLanguage(
    input: string,
    context: { mood?: EmotionMood; userPermissionLevel?: PermissionLevel } = {}
  ): Promise<BrainProcessResult> {
    const startTime = Date.now();
    const mood = context.mood || "Neutral";
    const userPerms = context.userPermissionLevel ?? PermissionLevel.LEVEL_4_SENSITIVE;

    // AI Model Intent Processing
    const aiResponse = await this.modelRouter.generateResponse(input, { mood });

    const toolResults: ToolExecutionResult[] = [];
    let executedDetails = "";

    // Execute requested tools securely
    if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
      for (const call of aiResponse.toolCalls) {
        const res = await this.toolRegistry.executeTool(
          {
            toolName: call.toolName,
            arguments: call.args,
            requestId: `req_${Date.now()}`,
            sessionId: "default_session",
          },
          userPerms
        );
        toolResults.push(res);

        if (res.success) {
          executedDetails += ` ${res.result?.message || res.toolName + " complete."}`;
        } else {
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

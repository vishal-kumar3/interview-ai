
import OpenAi from "openai"
import { zodResponseFormat } from "openai/helpers/zod";
import * as zod from "zod";

const client = new OpenAi({
  apiKey: process.env.GROK_API_KEY || process.env.GEMINI_API_KEY,
  baseURL: process.env.GROK_BASE_URL || process.env.GEMINI_BASE_URL,
})


export const createAiCompletion = async (
  messages: OpenAi.Chat.ChatCompletionMessageParam[],
  outputSchema?: zod.ZodType<any, any, any>,
  outputName?: string
) => {
  try {
    const query: any = {
      model: process.env.GROK_MODEL || process.env.GEMINI_MODEL,
      messages,
    }

    if (outputSchema && outputName) query.response_format = zodResponseFormat(outputSchema, outputName);


    const response = await client.chat.completions.create(query);
    return {
      error: null,
      response: response.choices[0].message.content
    }
  } catch (error) {
    return {
      error: "Failed to create AI completion",
      response: null,
    }
  }
}

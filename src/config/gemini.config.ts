import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


const history = [
  {
    role: ""
  }
]

export const createGenAIChat = async (messages: any[]) => {

  const chat = ai.chats.create({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    history: messages,
    config: {
      systemInstruction: ""
    }
  })
}

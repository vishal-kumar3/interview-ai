import { GoogleGenAI, SchemaUnion } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


const history = [
  {
    role: ""
  }
]

export const createGenAIChat = async (messages: any[], systemInstruction: string,responseSchema: any) => {

  const chat = ai.chats.create({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    history: messages,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    }
  })
}


export const createGenAIText = async (messages: string, systemInstruction: string, responseSchema?: SchemaUnion) => {
  const text = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    contents: messages,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: responseSchema ? "application/json" : "text/plain",
      responseSchema: responseSchema,
    },
  });

  if (!text.candidates || text.candidates.length === 0) {
    throw new Error("No candidates returned from Gemini AI");
  }

  return text.candidates[0].content;
}

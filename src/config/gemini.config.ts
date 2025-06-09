import { audioAnalysisResponseSchema, audioAnalysisSchema, audioAnalysisSystemInstructions } from "@/schema/audio.schema";
import { Content, ContentUnion, createPartFromUri, createUserContent, GoogleGenAI, SchemaUnion } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


export type GeminiHistoryType = {
  role: "user" | "assistant" | "system";
  parts: {
    text: string;
  }[]
}

export const createGenAIChat = async (messages: GeminiHistoryType[] | Content[], systemInstruction: ContentUnion | string | undefined, responseSchema: any) => {

  const chat = ai.chats.create({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    history: messages,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    }
  })

  return chat
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

export const transcriptFromAudio = async (filePath: string, fileType: string | undefined) => {

  const uploadedFile = await ai.files.upload({
    file: filePath,
    config: {
      mimeType: fileType || "audio/mpeg",
    }
  })

  if (!uploadedFile || !uploadedFile.uri) {
    return {
      error: "File upload failed",
      data: null
    }
  }

  const transcript = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
    contents: createUserContent([
      createPartFromUri(uploadedFile.uri, uploadedFile.mimeType || "audio/mpeg"),
    ]),
    config: {
      systemInstruction: audioAnalysisSystemInstructions,
      responseMimeType: "application/json",
      responseSchema: audioAnalysisResponseSchema
    }
  })

  if (!transcript || !transcript.text) {
    return {
      error: "Transcription failed",
      data: null
    }
  }

  const { error, data } = audioAnalysisSchema.safeParse(JSON.parse(transcript.text));

  if (error || !data) {
    return {
      error: "Transcription data is invalid",
      data: null
    }
  }

  return {
    error: null,
    data: data
  }
}

"use server"

import { pushInterviewQuestion } from "@/actions/interview.action";
import { createGenAIChat } from "@/config/gemini.config";
import { createCacheKey, redisCache, RedisCachePrefix } from "@/config/redis.config";
import { aiQuestionSchema } from "@/schema/question.schema";
import { GenerateContentConfig, Content } from "@google/genai";

interface RedisChat {
  config?: GenerateContentConfig
  history: Content[]
}

export const createChatFromConfig = async (redisChat: RedisChat) => {
  const chat = await createGenAIChat(
    redisChat.history,
    redisChat.config?.systemInstruction,
    redisChat.config?.responseSchema
  );

  return chat;
}


export const generateInitialQuestion = async (interviewId: string) => {
  const getCacheChat = await redisCache.get(createCacheKey(RedisCachePrefix.INTERVIEW, interviewId));
  const chat = await createChatFromConfig(getCacheChat as RedisChat);

  const initialQuestion = await chat.sendMessage({
    message: "Please start the interview by generating initial questions."
  })

  const { data, error, success } = aiQuestionSchema.safeParse(JSON.parse(initialQuestion.text ?? "{}"))
  if (!data || error || !success) {
    return { data: null, error: "Error while generating question, please try again." }
  }
  console.log("Generated initial question:", data)
  const question = await pushInterviewQuestion(interviewId, data)

  redisCache.set(
    createCacheKey(RedisCachePrefix.INTERVIEW, interviewId),
    chat
  )

  return { data: question, error: null }
}

export const submitResponse = async (interviewId: string, answer: string) => {
  const getCacheChat = await redisCache.get(createCacheKey(RedisCachePrefix.INTERVIEW, interviewId));
  const chat = await createChatFromConfig(getCacheChat as RedisChat);
  // Placeholder for response submission logic
}

export const nextQuestion = async (interviewId: string) => {
  const getCacheChat = await redisCache.get(createCacheKey(RedisCachePrefix.INTERVIEW, interviewId));
  const chat = await createChatFromConfig(getCacheChat as RedisChat);

  const nextQuestion = await chat.sendMessage({
    message: "please go ahead with either a follow-up if required or the next question for the interview."
  })

  const { data, error, success } = aiQuestionSchema.safeParse(JSON.parse(nextQuestion.text ?? "{}"))
  if (!data || error || !success) {
    return { data: null, error: "Error while generating next question, please try again." }
  }
  const question = await pushInterviewQuestion(interviewId, data)

  redisCache.set(
    createCacheKey(RedisCachePrefix.INTERVIEW, interviewId),
    chat
  )

  return { data: question, error: null }
}

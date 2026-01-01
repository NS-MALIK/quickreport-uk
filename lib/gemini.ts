import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your key
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// We use "flash" because it's fast and has the best free tier
export const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "You are a UK Construction Safety Officer. Convert transcripts into professional HSE Site Reports. Use British English.",
});
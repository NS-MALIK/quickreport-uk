import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Initialize Gemini with your secret key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    // 2. Select the Flash-Lite model for maximum free tier efficiency
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-lite",
      systemInstruction: `You are an expert UK Health & Safety (HSE) Officer. 
      Convert site notes into professional Daily Site Reports. 
      Use sections: [Job Details, Progress, Materials Used, Safety Observations, Next Steps].
      Use British English. Be concise but formal.`
    });

    // 3. Generate the content
    const result = await model.generateContent(`Process this site transcript: "${transcript}"`);
    const reportText = result.response.text();

    return NextResponse.json({ report: reportText });

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
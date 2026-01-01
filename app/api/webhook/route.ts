// import { NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase'; // Ensure you use service_role key here for admin access
// import crypto from 'crypto';

// export async function POST(req: Request) {
//   const rawBody = await req.text();
//   const signature = req.headers.get('x-signature') || '';
//   const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '';

//   // 1. Verify Signature (Security)
//   const hmac = crypto.createHmac('sha256', secret);
//   const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
//   const signatureBuffer = Buffer.from(signature, 'utf8');

//   if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
//     return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
//   }

//   const payload = JSON.parse(rawBody);
//   const eventName = payload.meta.event_name;
//   const userId = payload.meta.custom_data.user_id; // The ID we passed in the checkout URL

//   // 2. Update User Status in Supabase
//   if (eventName === 'subscription_created' || eventName === 'order_created') {
//     const { error } = await supabase
//       .from('profiles')
//       .update({ status: 'pro' })
//       .eq('id', userId);

//     if (error) console.error('Supabase Update Error:', error);
//   }

//   return NextResponse.json({ received: true });
// }


import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    // Use the most compatible stable model name
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      systemInstruction: `You are an expert UK Health & Safety (HSE) Officer. 
      Convert site notes into professional Daily Site Reports. 
      Use sections: [Job Details, Progress, Materials Used, Safety Observations, Next Steps].
      Use British English. Be concise but formal.`
    });

    // Generate content
    const result = await model.generateContent(`Process this site transcript: "${transcript}"`);
    
    // The SDK often throws before this if the response is empty, 
    // but we keep the check for safety
    const response = await result.response;
    const reportText = response.text();

    if (!reportText) {
      throw new Error("Empty response from AI");
    }

    return NextResponse.json({ report: reportText });

  } catch (error: any) {
    console.error("Gemini API Error Details:", error);

    // Handle Model/Version Mismatch (404)
    if (error.status === 404) {
      return NextResponse.json(
        { error: "AI Model configuration error. Please contact support." }, 
        { status: 404 }
      );
    }

    // Handle Quota (429)
    if (error.status === 429) {
      return NextResponse.json(
        { error: "Daily limit reached. Try again tomorrow or upgrade to Pro." }, 
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "AI generation failed. Please try again." }, 
      { status: 500 }
    );
  }
}
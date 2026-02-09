
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SocialPlatform, SocialInsight } from "./types";

/**
 * GATHSALT Intelligence Capture using Gemini 3 Pro.
 */
export async function generateInsight(input: string): Promise<SocialInsight> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a GATHSALT intelligence operative. Analyze this social media capture URL or snippet. 
    Source: ${input}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING },
          summary: { type: Type.STRING },
          explanation: { type: Type.STRING },
          sentiment: { type: Type.STRING },
          keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["platform", "summary", "explanation", "sentiment", "keyTakeaways"]
      }
    }
  });

  const rawJson = JSON.parse(response.text || "{}");
  
  let platform = SocialPlatform.UNKNOWN;
  const platformLower = (rawJson.platform || "").toLowerCase();
  if (platformLower.includes("x") || platformLower.includes("twitter")) platform = SocialPlatform.X;
  else if (platformLower.includes("facebook")) platform = SocialPlatform.FACEBOOK;
  else if (platformLower.includes("instagram")) platform = SocialPlatform.INSTAGRAM;

  return {
    id: Math.random().toString(36).substr(2, 9),
    sourceUrl: input,
    platform,
    summary: rawJson.summary || "Summary withheld.",
    explanation: rawJson.explanation || "No context provided.",
    sentiment: (rawJson.sentiment as any) || 'neutral',
    keyTakeaways: rawJson.keyTakeaways || [],
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate Audio from Text (TTS).
 */
export async function speakText(text: string, voiceName: string = 'Kore'): Promise<void> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say this in a futuristic, strategic tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!base64Audio) return;

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const uint8 = decodeBase64(base64Audio);
  const audioBuffer = await decodeAudioData(uint8, audioCtx, 24000, 1);
  
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioCtx.destination);
  source.start();
}

/**
 * Audio Decoding Helpers
 */
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Analyze Media from the Sharing Module (Media Kit).
 */
export async function analyzeMedia(base64Data: string, mimeType: string): Promise<SocialInsight> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const imagePart = {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType: mimeType,
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        imagePart,
        { text: "Analyze this shared media (screenshot/photo). Identify if it's from Facebook, IG, or X. Extract the core intelligence." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          platform: { type: Type.STRING },
          summary: { type: Type.STRING },
          explanation: { type: Type.STRING },
          sentiment: { type: Type.STRING },
          keyTakeaways: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["platform", "summary", "explanation", "sentiment", "keyTakeaways"]
      }
    }
  });

  const rawJson = JSON.parse(response.text || "{}");
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    mediaData: base64Data,
    platform: SocialPlatform.MEDIA,
    summary: rawJson.summary || "Visual capture processed.",
    explanation: rawJson.explanation || "No context provided.",
    sentiment: (rawJson.sentiment as any) || 'neutral',
    keyTakeaways: rawJson.keyTakeaways || [],
    timestamp: new Date().toISOString()
  };
}

export async function performDeepDive(insight: SocialInsight): Promise<{ analysis: string; sources: any[] }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Forensic culture-dive. Subject: ${insight.summary}. Context: ${insight.explanation}`,
    config: { tools: [{ googleSearch: {} }] }
  });

  return {
    analysis: response.text || "Analysis unavailable.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}

export async function chatAboutInsight(insight: SocialInsight, question: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Consultant for: ${insight.summary}.`,
    }
  });
  const response = await chat.sendMessage({ message: question });
  return response.text;
}

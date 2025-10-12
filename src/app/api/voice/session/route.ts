import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
import { ElevenLabsClient } from "elevenlabs";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

/**
 * Voice session endpoint - processes audio chunks
 * Flow: Audio → Deepgram STT → Gemini → ElevenLabs TTS → Audio response
 */

export async function POST(req: NextRequest) {
  try {
    console.log("🎙️ Voice session request received");
    const { audioData, topic, conversationHistory, isInitial } = await req.json();
    console.log("📊 Audio data length:", audioData?.length, "Topic:", topic, "Initial:", isInitial);

    // Validate API keys
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!deepgramApiKey) {
      console.error("❌ DEEPGRAM_API_KEY not found");
      return NextResponse.json(
        { error: "Deepgram API key not configured" },
        { status: 500 }
      );
    }
    
    if (!googleApiKey) {
      console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY not found");
      return NextResponse.json(
        { error: "Google API key not configured" },
        { status: 500 }
      );
    }

    // Initialize Deepgram client
    const deepgram = createClient(deepgramApiKey);

    let transcript = "";

    // Step 1: Convert audio to text using Deepgram (skip if initial greeting)
    if (!isInitial && audioData) {
      console.log("🎤 Transcribing audio with Deepgram...");
      
      try {
        // Convert base64 audio to buffer
        const inputAudioBuffer = Buffer.from(audioData, "base64");
        console.log("📊 Audio buffer size:", inputAudioBuffer.length, "bytes");
        
        const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
          inputAudioBuffer,
          {
            model: "nova-2",
            smart_format: true,
            language: "en", // Use generic English for better compatibility
          }
        );

        if (error) {
          console.error("❌ Deepgram API error:", JSON.stringify(error, null, 2));
          return NextResponse.json(
            { 
              error: "Speech recognition failed", 
              details: error.toString(),
              message: "Could not transcribe audio. Please try speaking again."
            },
            { status: 500 }
          );
        }
        
        if (!result || !result.results) {
          console.error("❌ Deepgram returned no results");
          return NextResponse.json(
            { error: "No transcription results", message: "Please try speaking again." },
            { status: 500 }
          );
        }
        
        transcript = result.results?.channels[0]?.alternatives[0]?.transcript || "";
      } catch (err) {
        console.error("❌ Deepgram transcription error:", err);
        return NextResponse.json(
          { 
            error: "Transcription failed", 
            details: err instanceof Error ? err.message : String(err),
            message: "Failed to process audio. Please try again."
          },
          { status: 500 }
        );
      }
      
      if (!transcript || transcript.trim().length === 0) {
        return NextResponse.json(
          { 
            transcript: "",
            message: "No speech detected. Please try again.",
          },
          { status: 200 }
        );
      }

      console.log("📝 Transcript:", transcript);
    } else if (isInitial) {
      // For initial greeting, use a default prompt
      transcript = `Hello, I'd like to learn about ${topic}`;
      console.log("📝 Initial greeting request");
    }

    // Step 2: Generate AI response using Gemini (optimized for speed)
    console.log("🤖 Generating response with Gemini...");
    console.log("📝 User said:", transcript);
    console.log("📚 Conversation history length:", conversationHistory?.length || 0);
    const geminiStartTime = Date.now();
    
    // Check if this is the first message (no conversation history)
    const isFirstMessage = !conversationHistory || conversationHistory.length === 0;
    
    // Ultra-short system prompt for faster processing
    const systemPrompt = isFirstMessage 
      ? `You are a tutor teaching about ${topic}. Give a brief 2-sentence introduction to the topic.`
      : `You are a tutor for ${topic}. The student just asked: "${transcript}". Answer their SPECIFIC question in 1-2 clear sentences. Do NOT repeat the introduction. Focus on answering what they asked.`;

    // Limit conversation history to last 6 messages (3 exchanges) for speed
    const recentHistory = (conversationHistory || []).slice(-6).map((msg: any) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content
    }));

    console.log("💬 Building messages with history:", recentHistory.length, "messages");

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...recentHistory,
      { role: "user" as const, content: transcript },
    ];
    
    console.log("📤 Sending to Gemini:", JSON.stringify(messages, null, 2));

    const { text: aiResponse } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      messages,
      temperature: 0.7, // Faster generation
    });

    const geminiTime = Date.now() - geminiStartTime;
    console.log("💬 AI Response:", aiResponse, `(${geminiTime}ms)`);
    console.log("🔍 Full conversation that will be returned:", [
      ...(conversationHistory || []),
      { role: "user", content: transcript },
      { role: "assistant", content: aiResponse },
    ]);
    
    // Clean and prepare response for voice
    const cleanResponse = aiResponse
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\*/g, '')   // Remove italic markers
      .replace(/#{1,6}\s/g, '') // Remove heading markers
      .replace(/`/g, '')    // Remove code markers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to just text
      // Handle common acronyms - add spaces between letters
      .replace(/\b([A-Z])\.([A-Z])\./g, '$1. $2. ') // E.M.F. → E. M. F.
      .replace(/\b([A-Z])\.([A-Z])\.([A-Z])\./g, '$1. $2. $3. ') // A.C.E. → A. C. E.
      .replace(/\b([A-Z]{2,})\b/g, (match) => match.split('').join('. ') + '.'); // EMF → E. M. F.

    // Step 3: Detect language and choose TTS provider
    const isEnglish = /^[a-zA-Z0-9\s.,!?;:'"-]+$/.test(topic);
    console.log("🌍 Language detection:", isEnglish ? "English" : "Non-English");
    
    let audioBase64: string;
    const ttsStartTime = Date.now();
    
    if (isEnglish) {
      // Use Deepgram for English (faster)
      console.log("🔊 Generating speech with Deepgram Aura...");
      
      const ttsResponse = await deepgram.speak.request(
        { text: cleanResponse },
        {
          model: "aura-stella-en",
          encoding: "linear16",
          sample_rate: 24000,
          speed: 0.9, // Slow down to 90% speed for better clarity
        }
      );

      const stream = await ttsResponse.getStream();
      if (!stream) {
        throw new Error("Failed to get audio stream from Deepgram");
      }

      const chunks: Buffer[] = [];
      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(Buffer.from(value));
      }
      
      const outputAudioBuffer = Buffer.concat(chunks);
      audioBase64 = outputAudioBuffer.toString("base64");
    } else {
      // Use ElevenLabs for non-English (better multilingual support)
      console.log("🔊 Generating speech with ElevenLabs (multilingual)...");
      
      const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
      if (!elevenLabsApiKey) {
        console.error("❌ ELEVENLABS_API_KEY not found for non-English");
        return NextResponse.json(
          { error: "ElevenLabs API key required for non-English languages" },
          { status: 500 }
        );
      }
      
      const elevenlabs = new ElevenLabsClient({ apiKey: elevenLabsApiKey });
      
      const audio = await elevenlabs.textToSpeech.convert("21m00Tcm4TlvDq8ikWAM", {
        text: cleanResponse,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      });

      const chunks: Buffer[] = [];
      for await (const chunk of audio) {
        chunks.push(Buffer.from(chunk));
      }
      const outputAudioBuffer = Buffer.concat(chunks);
      audioBase64 = outputAudioBuffer.toString("base64");
    }

    const ttsTime = Date.now() - ttsStartTime;
    const totalTime = Date.now() - geminiStartTime + geminiTime;
    console.log(`✅ Voice response generated (Gemini: ${geminiTime}ms, TTS: ${ttsTime}ms, Total: ${totalTime}ms)`);

    return NextResponse.json({
      transcript,
      aiResponse,
      audioBase64,
      conversationHistory: [
        ...(conversationHistory || []),
        { role: "user", content: transcript },
        { role: "assistant", content: aiResponse },
      ],
    });

  } catch (error) {
    console.error("❌ Voice session error:", error);
    return NextResponse.json(
      {
        error: "Failed to process voice input",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

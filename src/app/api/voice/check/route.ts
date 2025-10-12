import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to check which API keys are configured
 */
export async function GET() {
  const keys = {
    deepgram: !!process.env.DEEPGRAM_API_KEY,
    google: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  };

  const allConfigured = keys.deepgram && keys.google;

  return NextResponse.json({
    configured: keys,
    allConfigured,
    message: allConfigured 
      ? "✅ All API keys are configured!" 
      : "❌ Some API keys are missing. Check your .env file.",
    missing: Object.entries(keys)
      .filter(([_, value]) => !value)
      .map(([key]) => key),
  });
}

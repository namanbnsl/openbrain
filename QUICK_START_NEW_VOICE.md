# Quick Start: New Voice Teaching System 🎙️

**Jai Shree Ram! Govinda Govinda! Hara Hara Mahadev!** 🙏

## What Changed?

✅ **Removed**: LiveKit + E2B Python agent (complex)  
✅ **Added**: Deepgram + ElevenLabs (simple, reliable)  

## 3-Step Setup

### Step 1: Install Dependencies

```bash
npm install
# or
bun install
```

This installs:
- `@deepgram/sdk` - Speech-to-text
- `elevenlabs` - Voice synthesis

### Step 2: Get API Keys

1. **Deepgram**: https://deepgram.com/
   - Sign up → Dashboard → Copy API key
   - Free: 200 hours/month

2. **ElevenLabs**: https://elevenlabs.io/
   - Sign up → Profile → Copy API key
   - Free: 10,000 characters/month

### Step 3: Add to `.env`

```env
# Already have
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key

# Add these
DEEPGRAM_API_KEY=your_deepgram_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

## Test It!

```bash
npm run dev
```

1. Open http://localhost:3000/chat
2. Type: **"Teach me about JavaScript live"**
3. Click microphone button
4. Speak your question
5. Click microphone again
6. Listen to AI response! 🎉

## How It Works

```
You speak → Deepgram (STT) → Gemini (AI) → ElevenLabs (TTS) → You hear
```

**Much simpler than LiveKit!**

## Benefits

✅ **No Python needed** - Pure TypeScript/JavaScript  
✅ **No E2B sandbox** - Direct API calls  
✅ **Better voice quality** - ElevenLabs is industry-leading  
✅ **Easier debugging** - Server logs, no agent crashes  
✅ **Faster setup** - 2 API keys vs 4  
✅ **More reliable** - No agent process to manage  

## Troubleshooting

**TypeScript errors after install?**
```bash
# Restart dev server
Ctrl+C
npm run dev
```

**"Cannot find module" errors?**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**"API keys not configured"?**
- Add all 3 keys to `.env`
- Restart dev server

## Next Steps

- Read `VOICE_TEACHING_SETUP.md` for full documentation
- Customize voice in `src/app/api/voice/session/route.ts`
- Try different Gemini models

---

**Jai Shree Ram! Govinda Govinda! Hara Hara Mahadev!** 🙏

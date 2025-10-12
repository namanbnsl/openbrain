# OpenBrain - AI Teaching Platform

An intelligent teaching platform with video generation and live voice tutoring capabilities.

## Features

- 🎥 **Manim Video Generation**: Create educational animations using AI
- 🎙️ **Live Voice Teaching**: Real-time voice interaction with AI tutor powered by Deepgram, ElevenLabs and Google Gemini
- 💬 **Chat Interface**: Text-based AI assistance
- 🧠 **Smart Tools**: Automatic tool selection based on user requests

## Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Environment Variables

Set up environment variables according to `.env.example`:

**Required:**
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini API key
- `E2B_API_KEY` - E2B sandbox API key

**For Live Teaching Feature:**
- `LIVEKIT_URL` - Your LiveKit server URL (e.g., `wss://your-project.livekit.cloud`)
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret

**Optional:**
- Vercel KV credentials for job storage
- Uploadthing credentials for file uploads
- Convex credentials for database

### 3. Build E2B Sandbox

Build the `manim-ffmpeg-latex-voiceover` sandbox via the E2B CLI:

```bash
e2b sandbox build -c sandbox-templates/manim-ffmpeg-latex-voiceover/e2b.Dockerfile
```

### 4. Run the Application

**Start Inngest server:**
```bash
bunx inngest-cli dev
```

**Start Next.js server:**
```bash
bun dev
```

**For Live Teaching - No separate agent needed!**
Just run `bun dev` and it works!

### 5. Access the Application

- Main app: `http://localhost:3000`
- Inngest UI: `http://localhost:8288`

## Using Live Voice Teaching

1. In the chat, ask the AI to teach you something live:
   - "Teach me about quantum physics live"
   - "Can you explain calculus to me using voice?"
   - "I want a live tutoring session on JavaScript"

2. The AI will automatically start a LiveKit voice session
3. Grant microphone permissions when prompted
4. Start speaking with your AI tutor!

## Setup Notes

- **Vercel KV**: Create an Upstash instance on Vercel Storage for production job storage
- **LiveKit**: Sign up at [LiveKit Cloud](https://cloud.livekit.io/) for voice teaching credentials
- **Google Gemini**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Architecture

- **Frontend**: Next.js 15 with React 19
- **AI**: Google Gemini 2.5 Flash
- **Voice**: LiveKit for real-time audio
- **Video**: Manim Community for animations
- **Sandbox**: E2B for code execution
- **Jobs**: Inngest for background processing

To setup Vercel KV, create an Upstash on Vercel Storage. 

Please build the `manim-ffmpeg-latex-voiceover` sandbox via the E2B cli and then put in your `E2B_API_KEY`.

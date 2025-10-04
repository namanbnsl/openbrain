"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, PhoneOff, Loader2, Volume2, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceTeachingProps {
  topic: string;
  onClose?: () => void;
  onConversationEnd?: (conversation: Array<{ role: string; content: string }>) => void;
}

export function VoiceTeaching({ topic, onClose, onConversationEnd }: VoiceTeachingProps) {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted
  const [isRecording, setIsRecording] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackAudioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isActive) {
      startSession();
    }
    // Only cleanup when component unmounts, not when isActive changes
    return () => {
      if (!isActive) {
        cleanup();
      }
    };
  }, [isActive]);

  const cleanup = () => {
    // Cancel any ongoing API requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Clear all timeouts
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Stop media recorder safely
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      } catch (e) {
        // Ignore errors during cleanup
      }
      mediaRecorderRef.current = null;
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Stop any playing audio
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      audioSourceRef.current = null;
    }
    
    // Close audio contexts
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    
    if (playbackAudioContextRef.current) {
      playbackAudioContextRef.current.close().catch(() => {});
      playbackAudioContextRef.current = null;
    }
    
    // Reset states
    setIsProcessing(false);
    setIsPlaying(false);
    setIsRecording(false);
    setIsMuted(true);
    setProcessingTime(0);
  };

  const startSession = async () => {
    // Prevent starting if already active
    if (streamRef.current) {
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Setup audio visualization and VAD
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // Setup audio visualization
      monitorAudioLevels();
      
      // Get initial greeting from AI
      getInitialGreeting();
      
      toast.success("Voice session started");
    } catch (error) {
      console.error("Error starting session:", error);
      toast.error("Microphone access denied");
      // Don't set isActive to false, let user try again or manually close
    }
  };

  const toggleMute = () => {
    if (!streamRef.current) return;
    
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      // Muting - stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Unmuting - start recording
      startRecording();
    }
  };
  
  const startRecording = () => {
    if (!streamRef.current || !isActive) return;
    
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: "audio/webm" });
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const chunks = [...audioChunksRef.current];
      audioChunksRef.current = [];
      
      if (chunks.length > 0 && isActive) {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await processAudio(audioBlob);
      }
    };

    try {
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting MediaRecorder:", error);
      toast.error("Failed to start recording");
    }
  };

  const monitorAudioLevels = () => {
    const dataArray = new Uint8Array(analyserRef.current!.frequencyBinCount);
    
    const checkAudioLevel = () => {
      if (!analyserRef.current || !isActive) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedLevel = average / 255;
      
      // Only show audio level when recording
      if (isRecording && !isMuted) {
        setAudioLevel(normalizedLevel);
      } else {
        setAudioLevel(0);
      }

      animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
    };

    checkAudioLevel();
  };

  const getInitialGreeting = async () => {
    setIsProcessing(true);
    try {
      // Send empty audio to trigger initial response
      const response = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData: "",
          topic,
          conversationHistory: [],
          isInitial: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Initial greeting received:", data);
        if (data.audioBase64 && data.conversationHistory) {
          console.log("📚 Setting initial conversation history:", data.conversationHistory);
          setConversationHistory(data.conversationHistory);
          await playAudio(data.audioBase64);
        }
      } else {
        console.error("❌ Initial greeting failed:", response.status);
      }
    } catch (error) {
      console.error("Error getting initial greeting:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    if (audioBlob.size < 1000) return; // Ignore very small audio chunks
    if (!isActive) return; // Don't process if session ended
    
    setIsProcessing(true);
    const startTime = Date.now();
    
    // Update processing time every 100ms
    const timeInterval = setInterval(() => {
      setProcessingTime(Date.now() - startTime);
    }, 100);
    
    // Create abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const audioData = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      });

      // Send to API with abort signal
      console.log("📤 Sending to API with conversation history:", {
        topic,
        historyLength: conversationHistory?.length || 0,
        history: conversationHistory
      });
      
      const response = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioData,
          topic,
          conversationHistory: conversationHistory || [], // Ensure it's always an array
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: "Unknown error",
          message: "Failed to get error details from server"
        }));
        console.error("❌ API error response:", errorData);
        console.error("❌ Response status:", response.status);
        
        // Show user-friendly error
        const errorMessage = errorData.message || errorData.error || "Failed to process audio";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ API response received:", {
        transcript: data.transcript,
        hasAudio: !!data.audioBase64,
        historyLength: data.conversationHistory?.length
      });
      
      if (data.transcript && data.transcript.trim().length > 0) {
        console.log("📚 Updating conversation history:", data.conversationHistory);
        setConversationHistory(data.conversationHistory);

        // Play AI response
        if (data.audioBase64) {
          await playAudio(data.audioBase64);
        }
      }

    } catch (error: any) {
      // Don't show error if request was aborted (session ended)
      if (error.name === 'AbortError') {
        console.log("Request aborted - session ended");
      } else {
        console.error("Error processing audio:", error);
        if (isActive) {
          toast.error("Processing failed");
        }
      }
    } finally {
      clearInterval(timeInterval);
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setIsProcessing(false);
      setProcessingTime(0);
    }
  };

  const playAudio = async (base64Audio: string) => {
    if (!isActive) return; // Don't play if session ended
    
    // Auto-mute when AI starts speaking
    setIsMuted(true);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    
    setIsPlaying(true);
    try {
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }

      const audioContext = new AudioContext();
      playbackAudioContextRef.current = audioContext;
      
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const source = audioContext.createBufferSource();
      audioSourceRef.current = source;
      
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        if (isActive) {
          setIsPlaying(false);
        }
        audioContext.close();
        audioSourceRef.current = null;
        playbackAudioContextRef.current = null;
      };

      source.start(0);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
      audioSourceRef.current = null;
      playbackAudioContextRef.current = null;
      if (isActive) {
        toast.error("Audio playback failed");
      }
    }
  };

  const endSession = () => {
    // First cleanup everything
    cleanup();
    
    // Then set inactive
    setIsActive(false);
    
    // Send conversation history to parent
    if (onConversationEnd && conversationHistory.length > 0) {
      onConversationEnd(conversationHistory);
    }
    
    // Close and destroy the widget - this is the ONLY place widget closes
    if (onClose) {
      // Small delay to ensure conversation is saved first
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Voice Teaching Session
        </CardTitle>
        <CardDescription>Topic: {topic}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isActive ? (
          <div className="flex flex-col items-center gap-4 p-8">
            <p className="text-center text-muted-foreground">
              Start a voice conversation with your AI tutor. The microphone will stay on and automatically detect when you're speaking.
            </p>
            <Button
              onClick={() => setIsActive(true)}
              size="lg"
              className="rounded-full px-8"
            >
              <Phone className="h-5 w-5 mr-2" />
              Start Call
            </Button>
          </div>
        ) : (
          <>
            {/* Status Display */}
            <div className="flex items-center justify-center h-24 bg-muted rounded-lg">
              {isRecording && !isProcessing && !isPlaying && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-1 items-end h-16">
                    {[...Array(20)].map((_, i) => {
                      const barHeight = Math.max(4, audioLevel * 64 * (0.5 + Math.sin(i * 0.5) * 0.5));
                      return (
                        <div
                          key={i}
                          className="w-2 bg-green-500 rounded-full transition-all duration-75"
                          style={{ height: `${barHeight}px` }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Recording - Speak now</span>
                  </div>
                </div>
              )}
              {isProcessing && (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Processing... {(processingTime / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
              {isPlaying && (
                <div className="flex items-center gap-2">
                  <Volume2 className="h-6 w-6 text-primary animate-pulse" />
                  <span className="text-sm text-muted-foreground">AI is speaking...</span>
                </div>
              )}
              {isMuted && !isProcessing && !isPlaying && (
                <div className="flex items-center gap-2">
                  <MicOff className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ready - Click below to ask a question</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={toggleMute}
                disabled={isProcessing || isPlaying}
                variant={isMuted ? "default" : "destructive"}
                size="lg"
                className="rounded-full px-8"
              >
                {isMuted ? (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    Hold to Speak
                  </>
                ) : (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    Stop Recording
                  </>
                )}
              </Button>
              
              <Button
                onClick={endSession}
                variant="outline"
                size="lg"
                className="rounded-full px-8"
              >
                <PhoneOff className="h-5 w-5 mr-2" />
                End Call
              </Button>
            </div>
            
            {/* Instructions */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
                <strong>How it works:</strong> Click "Hold to Speak" to ask your question. 
                When finished, click "Stop Recording" to send. The AI will respond automatically.
              </p>
            </div>

            {/* Conversation Display */}
            {conversationHistory && conversationHistory.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {conversationHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary/10 ml-8"
                        : "bg-muted mr-8"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 text-muted-foreground">
                      {msg.role === "user" ? "You" : "AI Tutor"}
                    </div>
                    <div className="text-sm">{msg.content}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Speak naturally - the AI will respond when you pause</p>
              <p>The microphone is always listening for your questions</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

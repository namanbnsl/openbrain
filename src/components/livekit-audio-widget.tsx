"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  topic: string;
  onClose?: () => void;
};

export function LivekitAudioWidget({ topic, onClose }: Props) {
  const roomName = useMemo(() => `teach-${topic.toLowerCase().replace(/\s+/g, "-")}`,[topic]);
  const [tokenResp, setTokenResp] = useState<{ token: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [joined, setJoined] = useState(true);
  const transcriptRef = useRef<string>("");
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    const identity = `user-${Math.random().toString(36).slice(2, 10)}`;
    fetch("/api/livekit/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ room: roomName, identity, name: identity }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || "Failed to fetch token");
        setTokenResp({ token: data.token, url: data.url });
      })
      .catch((e) => setError(e.message));
  }, [roomName]);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }
    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";
    recog.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          transcriptRef.current += transcript + "\n";
        } else {
          interim += transcript;
        }
      }
    };
    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);
    recognitionRef.current = recog;
    recog.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.();
    setIsListening(false);
  }, []);

  // Simple audio visualizer using WebAudio on mic input
  useEffect(() => {
    let raf = 0;
    const setup = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyserRef.current = analyser;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const c = canvas.getContext("2d");
        if (!c) return;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteTimeDomainData(dataArray);
          c.clearRect(0, 0, canvas.width, canvas.height);
          c.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--ring") || "#4f46e5";
          c.lineWidth = 2;
          c.beginPath();
          const sliceWidth = canvas.width / bufferLength;
          let x = 0;
          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;
            if (i === 0) c.moveTo(x, y);
            else c.lineTo(x, y);
            x += sliceWidth;
          }
          c.lineTo(canvas.width, canvas.height / 2);
          c.stroke();
          raf = requestAnimationFrame(draw);
        };
        draw();
      } catch {
        // ignore visualizer errors
      }
    };
    setup();
    return () => {
      cancelAnimationFrame(raf);
      analyserRef.current?.disconnect?.();
      audioCtxRef.current?.close?.();
      audioStreamRef.current?.getTracks?.().forEach((t) => t.stop());
      analyserRef.current = null;
      audioCtxRef.current = null;
      audioStreamRef.current = null;
    };
  }, []);

  const endCall = useCallback(() => {
    setJoined(false);
    try {
      recognitionRef.current?.stop?.();
    } catch {}
    setIsListening(false);
    onClose?.();
  }, [onClose]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-red-600 text-sm">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Ensure `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` are set in your environment.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!tokenResp) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm">Connecting to LiveKit for “{topic}”...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="grid grid-rows-[auto,auto,1fr]">
          <div className="flex items-center justify-between gap-2 p-2 border-b">
            <div className="text-sm font-medium">Teach Me Live — {topic}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
              {!isListening ? (
                <Button size="sm" onClick={startListening}>Start Transcript</Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={stopListening}>Stop Transcript</Button>
              )}
            </div>
          </div>

          <div className="p-2 text-xs text-muted-foreground border-b flex items-center justify-between gap-2">
            <span>Audio-only session. Your microphone may be used; camera is not required.</span>
            <Button size="sm" variant="destructive" onClick={endCall}>End Call</Button>
          </div>

          <div className="h-[360px] grid grid-rows-[1fr_auto]">
            <div className="h-full">
              {joined && (
                <LiveKitRoom
                  serverUrl={tokenResp.url}
                  token={tokenResp.token}
                  connect={true}
                  audio={true}
                  video={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <RoomAudioRenderer />
                </LiveKitRoom>
              )}
            </div>
            <div className="border-t p-2">
              <canvas ref={canvasRef} height={64} style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




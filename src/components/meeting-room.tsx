"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PhoneIcon, MicIcon, MicOffIcon, Volume2Icon, VolumeXIcon } from "lucide-react"
import Vapi from "@vapi-ai/web"

export function MeetingRoom() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false)
  const vapiRef = useRef<Vapi | null>(null)

  // Initialize Vapi
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_VAPI_API_KEY
    if (!apiKey) {
      console.warn('Vapi API key not found. Please set NEXT_PUBLIC_VAPI_API_KEY in your environment variables.')
      return
    }

    const vapi = new Vapi(apiKey)
    vapiRef.current = vapi

    // Set up event listeners
    vapi.on('call-start', () => {
      console.log('Call started')
      setIsCallActive(true)
      setIsConnecting(false)
    })

    vapi.on('call-end', () => {
      console.log('Call ended')
      setIsCallActive(false)
      setIsConnecting(false)
    })

    vapi.on('speech-start', () => {
      console.log('Speech started')
    })

    vapi.on('speech-end', () => {
      console.log('Speech ended')
    })

    vapi.on('message', (message: any) => {
      console.log('Message received:', message)
    })

    vapi.on('speech-start', () => {
      console.log('User started speaking')
    })

    vapi.on('speech-end', () => {
      console.log('User finished speaking')
    })

    vapi.on('error', (error: any) => {
      console.error('Vapi error:', error)
      setIsCallActive(false)
      setIsConnecting(false)
    })

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
    }
  }, [])

  const startCall = async () => {
    if (!vapiRef.current) return

    setIsConnecting(true)

    try {
      // Start the call with a classroom assistant
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || 'your-assistant-id'
      await vapiRef.current.start(assistantId)
    } catch (error) {
      console.error('Failed to start call:', error)
      setIsConnecting(false)
    }
  }

  const endCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop()
    }
    setIsCallActive(false)
    setIsConnecting(false)
  }

  const toggleMute = () => {
    if (vapiRef.current) {
      if (isMuted) {
        vapiRef.current.setMuted(false)
      } else {
        vapiRef.current.setMuted(true)
      }
      setIsMuted(!isMuted)
    }
  }

  const toggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted)
    // Note: Speaker mute functionality would need to be implemented based on your audio setup
  }



  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex flex-col overflow-hidden fixed inset-0">
      {/* Header */}
      <header className="flex items-center justify-center p-4 flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isCallActive ? 'bg-green-500' : 
            isConnecting ? 'bg-yellow-500' : 
            'bg-gray-400'
          }`} />
          <span className="text-sm font-medium text-muted-foreground">
            {isCallActive ? 'Classroom Assistant Active' : 
             isConnecting ? 'Connecting...' : 
             'Classroom Meeting'}
          </span>
        </div>
      </header>

      {/* Main Video Area - Takes up most of the screen */}
      <main className="flex-1 flex items-center justify-center p-8 min-h-0">
        <div className="relative w-full h-full max-w-4xl aspect-video bg-card rounded-2xl shadow-2xl overflow-hidden border border-border/50">
          {/* Video Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />

          {/* Main Participant */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar className="w-32 h-32 shadow-xl ring-4 ring-white/50">
              <AvatarFallback className="text-4xl font-semibold bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                AI
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Participant Name */}
          <div className="absolute bottom-6 left-6">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
              <span className="text-white font-medium text-sm">Classroom Assistant</span>
            </div>
          </div>

          {/* Meeting Status */}
          <div className="absolute top-6 left-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <span className="text-xs font-medium text-foreground">
                {isCallActive ? 'Voice call active' : 
                 isConnecting ? 'Connecting...' : 
                 'Ready to start'}
              </span>
            </div>
          </div>

          {/* Connection Status */}
          {isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Connecting to assistant...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Controls */}
      <footer className="flex justify-center p-6 flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20">
          <div className="flex items-center gap-4">
            {/* Start/End Call Button */}
            {!isCallActive ? (
              <Button
                onClick={startCall}
                disabled={isConnecting}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <PhoneIcon className="w-6 h-6" />
                <span className="sr-only">Start call</span>
              </Button>
            ) : (
              <Button
                onClick={endCall}
                size="lg"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full w-16 h-16 p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <PhoneIcon className="w-6 h-6 rotate-[135deg]" />
                <span className="sr-only">End call</span>
              </Button>
            )}

            {/* Mute Button */}
            {isCallActive && (
              <Button
                onClick={toggleMute}
                size="lg"
                variant={isMuted ? "destructive" : "outline"}
                className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                {isMuted ? <MicOffIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
                <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
              </Button>
            )}

            {/* Speaker Button */}
            {isCallActive && (
              <Button
                onClick={toggleSpeaker}
                size="lg"
                variant={isSpeakerMuted ? "destructive" : "outline"}
                className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                {isSpeakerMuted ? <VolumeXIcon className="w-5 h-5" /> : <Volume2Icon className="w-5 h-5" />}
                <span className="sr-only">{isSpeakerMuted ? 'Unmute speaker' : 'Mute speaker'}</span>
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Call Ended Overlay */}
      {!isCallActive && !isConnecting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneIcon className="w-8 h-8 text-destructive rotate-[135deg]" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Call Ended</h2>
            <p className="text-muted-foreground mb-6">The classroom session has been ended successfully.</p>
            <Button onClick={startCall} className="w-full">
              Start New Session
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
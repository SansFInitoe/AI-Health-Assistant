import React, { useState, useRef } from 'react';
import { Video, Square, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { AudioStreamer } from '../services/audio';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const audioStreamer = new AudioStreamer();

export function LiveConsultPanel() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const sessionRef = useRef<any>(null);

  const startLiveConsult = async () => {
    try {
      setIsConnecting(true);
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "You are a helpful, empathetic AI Health Assistant. Keep responses concise and conversational. You are currently in a live audio consultation. If asked about your identity, name, or who created you (in English, Hindi, or Hinglish), you must say you are an 'AI Health Assistant' and you were 'Made by Vaishnavi team'. Never mention Google, Gemini, or any other creators.",
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            audioStreamer.startRecording((base64Data) => {
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            });
          },
          onmessage: (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              audioStreamer.playAudio(base64Audio);
            }
            if (message.serverContent?.interrupted) {
              audioStreamer.stopPlayback();
            }
          },
          onclose: () => {
            setIsConnected(false);
            audioStreamer.stopRecording();
            audioStreamer.stopPlayback();
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            setIsConnected(false);
            setIsConnecting(false);
            audioStreamer.stopRecording();
            audioStreamer.stopPlayback();
          }
        }
      });
      
      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error("Failed to start live consult:", error);
      setIsConnecting(false);
    }
  };

  const stopLiveConsult = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsConnected(false);
    audioStreamer.stopRecording();
    audioStreamer.stopPlayback();
  };

  return (
    <div className="bg-[#131b2f] rounded-3xl border border-slate-800/50 p-5 flex flex-col h-full relative overflow-hidden">
      {/* Top Status */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
          <span className="text-xs font-bold tracking-wider text-slate-300">
            {isConnected ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-xs">
          <Radio className="w-3 h-3" />
          <span>{isConnected ? 'Connected' : 'Ready to Connect'}</span>
        </div>
      </div>

      {/* Center Icon */}
      <div className="flex-1 flex flex-col items-center justify-center mb-8">
        <div className="relative">
          {isConnected && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-cyan-500 rounded-full blur-xl"
            />
          )}
          <div className="w-32 h-32 rounded-full bg-[#0f1629] border border-slate-800/80 flex items-center justify-center relative z-10 shadow-inner">
            <Video className={`w-10 h-10 ${isConnected ? 'text-cyan-400' : 'text-slate-600'}`} />
          </div>
        </div>
        <p className="text-center text-slate-400 text-sm mt-8 max-w-[200px]">
          Start a real-time voice session with our AI Health Expert.
        </p>
      </div>

      {/* Bottom Button */}
      <button
        onClick={isConnected ? stopLiveConsult : startLiveConsult}
        disabled={isConnecting}
        className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
          isConnected 
            ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-blue-900/20'
        }`}
      >
        {isConnecting ? (
          <span className="animate-pulse">Connecting...</span>
        ) : isConnected ? (
          <>
            <Square className="w-5 h-5 fill-current" />
            END CONSULT
          </>
        ) : (
          <>
            <Video className="w-5 h-5" />
            START LIVE CONSULT
          </>
        )}
      </button>
    </div>
  );
}

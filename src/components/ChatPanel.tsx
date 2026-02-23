import React, { useState, useRef, useEffect } from 'react';
import { Activity, RefreshCw, Bot, Paperclip, Mic, Send, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import Markdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
};

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: "Hello! I'm your AI Health Assistant. 🩺\nYou can describe your symptoms in English, Hindi, or Hinglish. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{data: string, mimeType: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() && !selectedImage) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      image: selectedImage?.data
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);
    
    const currentImage = selectedImage;
    setSelectedImage(null);

    try {
      const parts: any[] = [];
      if (currentImage) {
        parts.push({
          inlineData: {
            data: currentImage.data.split(',')[1],
            mimeType: currentImage.mimeType
          }
        });
      }
      if (text.trim()) {
        parts.push({ text: text });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          systemInstruction: "You are an AI Health Assistant. Provide helpful, safe, and concise health information. Always advise users to consult a real doctor for serious conditions. Format responses nicely. If asked about your identity, name, or who created you (in English, Hindi, or Hinglish), you must say you are an 'AI Health Assistant' and you were 'Made by Vaishnavi team'. Never mention Google, Gemini, or any other creators."
        }
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I couldn't process that."
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error processing your request."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage({
          data: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const playTTS = async (text: string, messageId: string) => {
    if (playingAudioId === messageId) {
      // Stop playing
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(messageId);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        const binary = atob(base64Audio);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setPlayingAudioId(null);
        source.start();
      } else {
        setPlayingAudioId(null);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setPlayingAudioId(null);
    }
  };

  const suggestions = [
    "✨ Mujhe sirdard hai",
    "✨ I have a stomach ache",
    "✨ Tips for better sleep"
  ];

  return (
    <div className="bg-[#131b2f] rounded-3xl border border-slate-800/50 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-800/50 flex justify-between items-center bg-[#131b2f]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center border border-slate-700/50 shadow-inner">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Health Assistant</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>Online • Good Morning</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center transition-colors border border-slate-700/30"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30 mt-1">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              )}
              
              <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-sm' 
                    : 'bg-white text-slate-900 rounded-tl-sm shadow-lg shadow-black/10'
                }`}>
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="max-w-full h-auto rounded-lg mb-3 object-cover max-h-48" />
                  )}
                  <div className={`prose max-w-none text-[15px] leading-relaxed prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-headings:text-base ${msg.role === 'user' ? 'prose-invert text-white' : 'prose-slate text-slate-900'}`}>
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
                
                {msg.role === 'model' && (
                  <button 
                    onClick={() => playTTS(msg.text, msg.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-xs text-slate-300 transition-colors border border-slate-700/50"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${playingAudioId === msg.id ? 'text-cyan-400 animate-pulse' : ''}`} />
                    {playingAudioId === msg.id ? 'Stop' : 'Listen'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 border border-cyan-500/30">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-5 pb-2 flex flex-wrap gap-2">
          {suggestions.map((sug, i) => (
            <button 
              key={i}
              onClick={() => handleSend(sug.replace('✨ ', ''))}
              className="px-4 py-2 rounded-full bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 text-sm text-slate-300 transition-colors flex items-center gap-2"
            >
              <span className="text-cyan-400">✨</span>
              {sug.replace('✨ ', '')}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-5 pt-2">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img src={selectedImage.data} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-slate-700" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 bg-slate-800 rounded-full p-1 border border-slate-600 hover:bg-slate-700"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        )}
        <div className="relative flex items-center">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute left-4 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your health question..."
            className="w-full bg-[#0f1629] border border-slate-700/50 rounded-full py-4 pl-12 pr-24 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
          
          <div className="absolute right-2 flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-slate-800/50">
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() && !selectedImage}
              className="p-2 bg-slate-800 hover:bg-cyan-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-slate-800"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

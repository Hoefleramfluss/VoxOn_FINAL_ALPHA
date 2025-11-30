import React, { useState } from 'react';
import { Bot, VoiceName } from '../types';

interface ConfigPanelProps {
  bot: Bot;
  onUpdate: (updatedBot: Bot) => void;
  onBack: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ bot, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'backend' | 'twilio'>('settings');

  // Helper to update deeply nested config
  const updateConfig = (field: keyof typeof bot.config, value: any) => {
    onUpdate({
        ...bot,
        config: {
            ...bot.config,
            [field]: value
        }
    });
  };

  const generateTwilioCode = () => {
    let toolsJson = "[]";
    try {
        const parsed = JSON.parse(bot.config.tools || "[]");
        toolsJson = JSON.stringify(parsed, null, 2);
    } catch (e) {
        // invalid json
    }

    return `/**
 * PRODUCTION SERVER FOR TWILIO + GEMINI LIVE
 * Bot ID: ${bot.id} (${bot.name})
 */
import { GoogleGenAI, Modality } from "@google/genai";
import Fastify from "fastify";
import fastifyWebSocket from "@fastify/websocket";
import dotenv from "dotenv";

dotenv.config();

const fastify = Fastify();
fastify.register(fastifyWebSocket);

// --- CONFIGURATION ---
const VOICE_NAME = "${bot.config.voiceName}";
const SYSTEM_INSTRUCTION = ${JSON.stringify(bot.config.systemInstruction)};
const GREETING = "${bot.config.greeting}";
const TOOLS = ${toolsJson}; 

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- BACKEND LOGIC ---
async function handleToolCall(functionCall) {
  console.log("Calling Backend Tool:", functionCall.name, functionCall.args);
  // Add your real backend connection here
  return { result: "Success" };
}

fastify.register(async (fastify) => {
  fastify.get("/media-stream", { websocket: true }, (connection, req) => {
    console.log("Call connected");
    // Send Greeting immediately upon connection
    // Note: To send audio greeting, you'd typically use TwiML <Say> before connecting stream
    // or inject audio into the stream.

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
        },
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: TOOLS.length > 0 ? [{ functionDeclarations: TOOLS }] : undefined,
      },
      callbacks: {
        onopen: () => console.log("Gemini Connected"),
        onmessage: async (msg) => {
          if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
            connection.socket.send(JSON.stringify({
              event: "media",
              media: { payload: msg.serverContent.modelTurn.parts[0].inlineData.data }
            }));
          }
          if (msg.toolCall) {
            const functionResponses = [];
            for (const call of msg.toolCall.functionCalls) {
              const res = await handleToolCall(call);
              functionResponses.push({ id: call.id, name: call.name, response: res });
            }
            sessionPromise.then(s => s.sendToolResponse({ functionResponses }));
          }
        },
      }
    });

    connection.socket.on("message", (message) => {
      const data = JSON.parse(message.toString());
      if (data.event === "media") {
        sessionPromise.then(s => s.sendRealtimeInput({
          media: { mimeType: "audio/pcm;rate=8000", data: data.media.payload }
        }));
      }
    });
  });
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) console.error(err);
  console.log("Server listening on port 3000");
});`;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Editor Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div>
                <input 
                    type="text" 
                    value={bot.name}
                    onChange={(e) => onUpdate({...bot, name: e.target.value})}
                    className="bg-transparent text-xl font-bold text-white focus:outline-none focus:border-b border-indigo-500"
                />
                <div className="text-xs text-slate-400 mt-1 flex gap-2 items-center">
                    <span>{bot.id}</span>
                    <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                    <span className={`uppercase ${bot.status === 'active' ? 'text-green-400' : 'text-amber-400'}`}>{bot.status}</span>
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium">
                Save Draft
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm font-medium shadow-lg shadow-indigo-500/20">
                Deploy Changes
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
          {/* Inner Sidebar for Settings */}
          <div className="w-64 bg-slate-800/50 border-r border-slate-700 p-4 space-y-2">
            <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                General Settings
            </button>
            <button 
                onClick={() => setActiveTab('backend')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'backend' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Backend & Tools
            </button>
            <button 
                onClick={() => setActiveTab('twilio')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'twilio' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Integration Code
            </button>
          </div>

          {/* Form Area */}
          <div className="flex-1 p-8 overflow-y-auto">
             <div className="max-w-3xl mx-auto">
                
                {activeTab === 'settings' && (
                    <div className="space-y-8 animate-fade-in">
                        <section>
                            <h3 className="text-lg font-medium text-white mb-4">Voice Persona</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.values(VoiceName).map((voice) => (
                                <button
                                    key={voice}
                                    onClick={() => updateConfig('voiceName', voice)}
                                    className={`p-4 rounded-xl border text-sm font-medium transition-all ${
                                    bot.config.voiceName === voice
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                                >
                                    <div className="mb-2 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </div>
                                    {voice}
                                </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-lg font-medium text-white mb-4">System Instructions</h3>
                            <textarea
                                value={bot.config.systemInstruction}
                                onChange={(e) => updateConfig('systemInstruction', e.target.value)}
                                rows={6}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed"
                                placeholder="Define the bot's personality and rules..."
                            />
                        </section>

                        <section>
                            <h3 className="text-lg font-medium text-white mb-4">Initial Greeting</h3>
                            <input
                                type="text"
                                value={bot.config.greeting}
                                onChange={(e) => updateConfig('greeting', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                            />
                        </section>
                    </div>
                )}

                {activeTab === 'backend' && (
                    <div className="h-full flex flex-col space-y-4 animate-fade-in">
                        <div className="bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-lg flex gap-4">
                            <div className="shrink-0">
                                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-indigo-300 font-semibold text-sm">Function Calling</h4>
                                <p className="text-slate-400 text-xs mt-1">
                                    Define tools in JSON format. The bot will intelligently decide when to call these functions based on the conversation context.
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 relative border border-slate-700 rounded-xl overflow-hidden bg-slate-950">
                             <div className="absolute top-0 right-0 bg-slate-800 text-xs text-slate-400 px-2 py-1 rounded-bl border-b border-l border-slate-700">JSON Editor</div>
                             <textarea
                                value={bot.config.tools}
                                onChange={(e) => updateConfig('tools', e.target.value)}
                                className="w-full h-[500px] bg-transparent p-4 font-mono text-sm text-green-400 outline-none resize-none"
                                spellCheck={false}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'twilio' && (
                    <div className="space-y-4 animate-fade-in">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-white">Generated Server Code</h3>
                            <button 
                                onClick={() => navigator.clipboard.writeText(generateTwilioCode())}
                                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors"
                            >
                                Copy to Clipboard
                            </button>
                         </div>
                         <pre className="bg-slate-950 p-6 rounded-xl border border-slate-800 overflow-x-auto text-xs text-slate-400 font-mono leading-relaxed">
                            {generateTwilioCode()}
                         </pre>
                    </div>
                )}

             </div>
          </div>
      </div>
    </div>
  );
};

export default ConfigPanel;

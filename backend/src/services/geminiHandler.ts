
import { GoogleGenAI, Modality } from "@google/genai";
import WebSocket from 'ws';

// Twilio standard: 8kHz mulaw
// Gemini Live standard: 16kHz or 24kHz PCM
// Note: For best results in production, use a transcoding library.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function handleGeminiStream(twilioSocket: WebSocket, botId: string) {
    
    // Fetch Bot Config (Voice, Instruction) from DB using botId
    // Mocking for now:
    const voiceName = 'Puck';
    const systemInstruction = 'You are a helpful assistant. You can use tools if the user asks.';

    const session = await ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
        systemInstruction: systemInstruction,
      },
      callbacks: {
        onopen: () => {
            console.log(`[Gemini] Session Connected for ${botId}`);
        },
        onmessage: (msg) => {
            // 1. Handle Audio from Gemini -> Twilio
            if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData) {
                const audioData = msg.serverContent.modelTurn.parts[0].inlineData.data;
                const response = {
                    event: "media",
                    media: {
                        payload: audioData
                    }
                };
                twilioSocket.send(JSON.stringify(response));
            }

            // 2. Handle Tool Calls (The Backend "Brain")
            if (msg.toolCall) {
                console.log(`[Gemini] Tool Call Received for ${botId}:`, JSON.stringify(msg.toolCall));
                
                const functionCalls = msg.toolCall.functionCalls;
                const functionResponses = functionCalls.map(fc => {
                    // In a real scenario, you would execute the specific logic here.
                    // e.g., if (fc.name === 'resmio_check_availability') { ... fetch API ... }
                    
                    console.log(`[Backend] Executing Tool: ${fc.name}`);
                    
                    // Return a generic success to keep the conversation flowing
                    return {
                        id: fc.id,
                        name: fc.name,
                        response: { 
                            result: { 
                                status: "success", 
                                message: `Tool ${fc.name} executed successfully on the backend.` 
                            } 
                        }
                    };
                });

                // Send the result back to Gemini so it can generate the next spoken response
                session.sendToolResponse({ functionResponses });
            }
        },
        onclose: () => {
            console.log("[Gemini] Session Closed");
            twilioSocket.close();
        }
      }
    });

    // Handle Messages from Twilio
    twilioSocket.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        
        if (msg.event === 'media') {
            // Audio from Twilio -> Gemini
            session.sendRealtimeInput({
                media: {
                    mimeType: "audio/pcm;rate=8000",
                    data: msg.media.payload
                }
            });
        }
        
        if (msg.event === 'stop') {
            session.close();
        }
    });
}

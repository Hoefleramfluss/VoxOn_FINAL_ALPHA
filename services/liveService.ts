import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { BotConfig } from '../types';
import { createPcmBlob, base64ToUint8Array, decodeAudioData } from '../utils/audioUtils';

export class LiveService {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputNode: GainNode | null = null;
  private outputNode: GainNode | null = null;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private nextStartTime: number = 0;
  private stream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private sessionPromise: Promise<any> | null = null;
  private currentSession: any = null;

  // Analyser for visualization
  public outputAnalyser: AnalyserNode | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  public async connect(config: BotConfig, onDisconnect: () => void, onError: (err: any) => void) {
    // 1. Setup Audio Contexts
    // Use standard 16kHz for input (Speech standard) and 24kHz for output (Gemini standard)
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    this.inputNode = this.inputAudioContext.createGain();
    this.outputNode = this.outputAudioContext.createGain();
    
    // Setup Analyser for visualizer
    this.outputAnalyser = this.outputAudioContext.createAnalyser();
    this.outputAnalyser.fftSize = 256;
    this.outputAnalyser.smoothingTimeConstant = 0.5;
    this.outputNode.connect(this.outputAnalyser);
    this.outputAnalyser.connect(this.outputAudioContext.destination);

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        } 
      });
    } catch (err) {
      console.error("Microphone access denied", err);
      onError(new Error("Microphone access denied. Please check your settings."));
      return;
    }

    // Parse tools config
    let tools = undefined;
    try {
      if (config.tools && config.tools.trim() !== "") {
        const parsedTools = JSON.parse(config.tools);
        if (Array.isArray(parsedTools) && parsedTools.length > 0) {
            tools = [{ functionDeclarations: parsedTools }];
        }
      }
    } catch (e) {
      console.warn("Invalid tools JSON, proceeding without tools", e);
    }

    // 2. Connect to Gemini Live
    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName } },
        },
        systemInstruction: config.systemInstruction,
        tools: tools,
      },
      callbacks: {
        onopen: () => {
          console.log("Session opened");
          this.startAudioInput();
        },
        onmessage: async (message: LiveServerMessage) => {
          this.handleMessage(message);
        },
        onclose: (e) => {
            console.log("Session closed", e);
            this.cleanup();
            onDisconnect();
        },
        onerror: (e) => {
            console.error("Session error", e);
            onError(e);
            this.cleanup();
            onDisconnect();
        }
      }
    });
    
    this.currentSession = await this.sessionPromise;
  }

  private startAudioInput() {
    if (!this.inputAudioContext || !this.stream) return;

    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    // 4096 buffer size offers a balance between latency and performance for ScriptProcessor
    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.sessionPromise) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = createPcmBlob(inputData);
      
      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle interruptions (Barge-in)
    const interrupted = message.serverContent?.interrupted;
    if (interrupted) {
      console.log("Interruption detected, clearing buffer");
      this.stopAudioOutput();
      return;
    }

    // Handle Tool Calls (Simulated Backend in Browser)
    if (message.toolCall) {
        const functionCalls = message.toolCall.functionCalls;
        console.log("Tool Call received:", functionCalls);
        
        // In the browser demo, we verify the tool was triggered and send a success response
        // In the Server Code (Production), this is where the real API call happens.
        const functionResponses = functionCalls.map(fc => ({
            id: fc.id,
            name: fc.name,
            response: { 
                result: "Success: Tool triggered in browser demo. Deploy server code to execute real backend logic.",
                status: "OK"
            }
        }));

        this.sessionPromise?.then(session => {
            session.sendToolResponse({ functionResponses });
        });
        return; // Tool calls usually don't have audio immediately, model will generate audio after response
    }

    // Handle Audio Output
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext && this.outputNode) {
        
      // Ensure smooth playback by scheduling slightly ahead if buffer underrun
      const currentTime = this.outputAudioContext.currentTime;
      if (this.nextStartTime < currentTime) {
          this.nextStartTime = currentTime + 0.05; // 50ms buffer for safety
      }

      try {
        const audioBuffer = await decodeAudioData(
          base64ToUint8Array(base64Audio),
          this.outputAudioContext,
          24000,
          1
        );

        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputNode);
        
        source.addEventListener('ended', () => {
          this.sources.delete(source);
        });

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.sources.add(source);
        
      } catch (err) {
        console.error("Error decoding audio", err);
      }
    }
  }

  private stopAudioOutput() {
    // Immediate stop for all playing sources
    for (const source of this.sources) {
        try {
            source.stop();
        } catch (e) {
            // ignore if already stopped
        }
    }
    this.sources.clear();
    
    // Reset time cursor
    if (this.outputAudioContext) {
        this.nextStartTime = this.outputAudioContext.currentTime;
    }
  }

  public async disconnect() {
    if (this.currentSession) {
        try {
            // Attempt graceful close
            (this.currentSession as any).close();
        } catch (e) {
            console.warn("Could not close session explicitly", e);
        }
    }
    this.cleanup();
  }

  private cleanup() {
    this.stopAudioOutput();

    if (this.scriptProcessor) {
        this.scriptProcessor.disconnect();
        this.scriptProcessor.onaudioprocess = null;
        this.scriptProcessor = null;
    }

    if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
    }

    if (this.inputAudioContext) {
        if (this.inputAudioContext.state !== 'closed') {
             this.inputAudioContext.close();
        }
        this.inputAudioContext = null;
    }

    if (this.outputAudioContext) {
        if (this.outputAudioContext.state !== 'closed') {
             this.outputAudioContext.close();
        }
        this.outputAudioContext = null;
    }
    
    this.inputNode = null;
    this.outputNode = null;
    this.outputAnalyser = null;
    this.sessionPromise = null;
    this.currentSession = null;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.outputAnalyser;
  }
}
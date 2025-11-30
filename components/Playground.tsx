import React, { useState, useRef, useEffect } from 'react';
import { Bot } from '../types';
import { LiveService } from '../services/liveService';
import AudioVisualizer from './AudioVisualizer';

interface PlaygroundProps {
  bots: Bot[];
}

const Playground: React.FC<PlaygroundProps> = ({ bots }) => {
  const [selectedBotId, setSelectedBotId] = useState<string>(bots[0]?.id || '');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{time: string, type: 'info'|'error'|'tool', msg: string}[]>([]);

  const liveServiceRef = useRef<LiveService | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Force re-render for visualizer
  const [, setTick] = useState(0);

  const selectedBot = bots.find(b => b.id === selectedBotId);

  const addLog = (type: 'info'|'error'|'tool', msg: string) => {
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type, msg }]);
  };

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleConnection = async () => {
    if (isConnected) {
        disconnect();
    } else {
        if (selectedBot) connect(selectedBot);
    }
  };

  const connect = async (bot: Bot) => {
    setError(null);
    setIsConnecting(true);
    addLog('info', `Initializing connection for ${bot.name}...`);
    
    liveServiceRef.current = new LiveService();

    try {
      await liveServiceRef.current.connect(
        bot.config,
        () => {
          setIsConnected(false);
          setIsConnecting(false);
          setTick(t => t + 1);
          addLog('info', 'Disconnected.');
        },
        (err) => {
          setError(err.message);
          addLog('error', err.message);
          setIsConnected(false);
          setIsConnecting(false);
        }
      );
      
      setIsConnected(true);
      setTick(t => t + 1);
      addLog('info', 'Session Connected. Start speaking.');
    } catch (e: any) {
      setError(e.message);
      addLog('error', e.message);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (liveServiceRef.current) {
      liveServiceRef.current.disconnect();
      liveServiceRef.current = null;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => disconnect();
  }, []);

  return (
    <div className="h-full flex flex-col p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-white mb-1">Playground</h1>
            <p className="text-slate-400">Test your agents in a simulated environment</p>
        </div>
        <div className="flex items-center gap-4">
            <select 
                value={selectedBotId}
                onChange={(e) => setSelectedBotId(e.target.value)}
                disabled={isConnected || isConnecting}
                className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
                {bots.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Visualizer & Controls */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-8">
                {/* Background FX */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0'}`}></div>
                </div>

                <div className="z-10 w-full max-w-lg space-y-8">
                    <div className="flex justify-center">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${isConnected ? 'bg-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.3)]' : 'bg-slate-800 border border-slate-700'}`}>
                            {isConnecting ? (
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className={`w-12 h-12 transition-colors ${isConnected ? 'text-indigo-400' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            )}
                        </div>
                    </div>

                    <AudioVisualizer 
                        analyser={liveServiceRef.current?.getAnalyser() || null} 
                        isActive={isConnected} 
                    />

                    <div className="flex justify-center">
                        <button
                            onClick={toggleConnection}
                            disabled={isConnecting}
                            className={`px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 ${
                                isConnected 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20' 
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-500'
                            }`}
                        >
                            {isConnected ? 'End Session' : 'Start Session'}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Logs Console */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">Live Logs</span>
                <button onClick={() => setLogs([])} className="text-xs text-slate-500 hover:text-white">Clear</button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
                {logs.length === 0 && (
                    <div className="text-slate-600 italic text-center mt-10">Waiting for events...</div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                        <span className="text-slate-600 shrink-0">[{log.time}]</span>
                        <span className={`${
                            log.type === 'error' ? 'text-red-400' : 
                            log.type === 'tool' ? 'text-amber-400' : 'text-slate-300'
                        }`}>
                            {log.msg}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Playground;


import React, { useState, useEffect, useRef } from 'react';

const ServerManager: React.FC = () => {
  // Scaling State
  const [minInstances, setMinInstances] = useState(1);
  const [maxInstances, setMaxInstances] = useState(5);
  const [cpuUsage, setCpuUsage] = useState(45);
  const [memoryUsage, setMemoryUsage] = useState(62);
  const [redisUsage, setRedisUsage] = useState(28);

  // Environment Config State
  const [envVars, setEnvVars] = useState([
    { key: 'GEMINI_API_KEY', value: 'AIzaSy...XyZ', visible: false },
    { key: 'DB_CONNECTION_STRING', value: 'postgres://user:pass@db.voiceomni.internal:5432/main', visible: false },
    { key: 'REDIS_URL', value: 'redis://cache.voiceomni.internal:6379', visible: false },
    { key: 'LOG_LEVEL', value: 'info', visible: true },
    { key: 'NODE_ENV', value: 'production', visible: true },
  ]);

  // Logs State
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Simulation Effects
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate stats
      setCpuUsage(prev => Math.max(10, Math.min(95, prev + (Math.random() * 10 - 5))));
      setMemoryUsage(prev => Math.max(20, Math.min(90, prev + (Math.random() * 6 - 3))));
      setRedisUsage(prev => Math.max(5, Math.min(60, prev + (Math.random() * 4 - 2))));

      // Add log
      if (Math.random() > 0.6) {
        const timestamp = new Date().toISOString();
        const messages = [
            `[INFO] GET /api/v1/health 200 4ms`,
            `[INFO] Job "billing_cycle" completed successfully`,
            `[DEBUG] Redis cache hit for key: bot_config_123`,
            `[WARN] High CPU usage detected on instance-x92`,
            `[INFO] Auto-scaling: Desired instances ${minInstances + 1}`
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        setLogs(prev => [...prev.slice(-49), `${timestamp} ${msg}`]);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [minInstances]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const toggleEnvVisibility = (index: number) => {
    const newVars = [...envVars];
    newVars[index].visible = !newVars[index].visible;
    setEnvVars(newVars);
  };

  const handleRestartService = (service: string) => {
    if (confirm(`Are you sure you want to restart ${service}? This may cause brief downtime.`)) {
        setLogs(prev => [...prev, `${new Date().toISOString()} [WARN] Restart signal sent to ${service}...`]);
        setTimeout(() => {
             setLogs(prev => [...prev, `${new Date().toISOString()} [INFO] ${service} restarted successfully.`]);
        }, 3000);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col animate-fade-in pb-20">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-white mb-1">Infrastructure Manager</h1>
            <p className="text-slate-400">Manage server instances, scaling policies, and environment configurations.</p>
        </div>
        <div className="flex gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded border border-slate-700 text-xs text-slate-300">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Region: eu-west-1 (Frankfurt)
             </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* SCALING CONTROLS */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Cloud Run Autoscaling
            </h3>
            
            <div className="space-y-8">
                {/* Min Instances */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Min Instances (Provisioned)</label>
                        <span className="text-indigo-400 font-mono font-bold">{minInstances}</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="10" 
                        value={minInstances}
                        onChange={(e) => setMinInstances(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between mt-2">
                        <p className="text-xs text-slate-500">
                            Set to 0 to enable <span className="text-amber-400 font-semibold">Cold Starts</span> (Save Cost). 
                            Set to 1+ for <span className="text-emerald-400 font-semibold">Warm Instances</span> (Low Latency).
                        </p>
                    </div>
                </div>

                {/* Max Instances */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-300">Max Instances (Limit)</label>
                        <span className="text-sky-400 font-mono font-bold">{maxInstances}</span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="50" 
                        value={maxInstances}
                        onChange={(e) => setMaxInstances(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <p className="text-xs text-slate-500 mt-2">Hard limit to prevent runaway costs during traffic spikes.</p>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700 grid grid-cols-3 gap-4">
                 <div className="bg-slate-900 rounded p-3 border border-slate-700/50">
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Est. Cost/Hr</div>
                    <div className="text-lg font-mono text-white">${(minInstances * 0.08 + (cpuUsage/100 * 0.04)).toFixed(3)}</div>
                 </div>
                 <div className="bg-slate-900 rounded p-3 border border-slate-700/50">
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Cold Start Latency</div>
                    <div className={`text-lg font-mono ${minInstances === 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {minInstances === 0 ? '~2.5s' : 'Instant'}
                    </div>
                 </div>
                 <div className="bg-slate-900 rounded p-3 border border-slate-700/50">
                    <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Active Containers</div>
                    <div className="text-lg font-mono text-white">{Math.max(minInstances, Math.floor(minInstances + (cpuUsage/20)))}</div>
                 </div>
            </div>
        </div>

        {/* RESOURCE MONITOR */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-between">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Resources
            </h3>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">vCPU Usage</span>
                        <span className="text-slate-200">{cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${cpuUsage}%` }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">RAM Usage</span>
                        <span className="text-slate-200">{memoryUsage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${memoryUsage}%` }}></div>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Redis Memory</span>
                        <span className="text-slate-200">{redisUsage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${redisUsage}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-3">
                <button 
                    onClick={() => handleRestartService('API Server')}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm font-medium transition-colors border border-slate-600"
                >
                    Restart API Server
                </button>
                <button 
                    onClick={() => handleRestartService('Redis Cache')}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm font-medium transition-colors border border-slate-600"
                >
                    Flush Redis Cache
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
          
          {/* LOGS TERMINAL */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
              <div className="bg-slate-900 p-3 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Infrastructure Logs</span>
                  <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 space-y-1">
                  {logs.map((log, i) => (
                      <div key={i} className="break-all hover:bg-slate-900/50 px-1 rounded">
                          {log}
                      </div>
                  ))}
                  <div ref={logsEndRef} />
              </div>
          </div>

          {/* ENV VARS EDITOR */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl flex flex-col overflow-hidden">
              <div className="bg-slate-900 p-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase">Environment Variables (.env)</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                  <table className="w-full text-left border-collapse">
                      <thead>
                          <tr className="text-xs text-slate-500 uppercase border-b border-slate-700">
                              <th className="pb-2">Key</th>
                              <th className="pb-2">Value</th>
                              <th className="pb-2 w-10"></th>
                          </tr>
                      </thead>
                      <tbody className="font-mono text-sm">
                          {envVars.map((v, i) => (
                              <tr key={i} className="group hover:bg-slate-700/30">
                                  <td className="py-3 pr-4 text-indigo-400 font-bold">{v.key}</td>
                                  <td className="py-3 pr-4 text-slate-300">
                                      {v.visible ? v.value : '••••••••••••••••'}
                                  </td>
                                  <td className="py-3 text-right">
                                      <button onClick={() => toggleEnvVisibility(i)} className="text-slate-500 hover:text-white">
                                          {v.visible ? (
                                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                              </svg>
                                          ) : (
                                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                              </svg>
                                          )}
                                      </button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end">
                      <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded shadow-lg shadow-indigo-500/20">
                          Save Changes & Restart
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ServerManager;

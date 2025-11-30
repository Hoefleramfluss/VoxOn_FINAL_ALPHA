import React, { useEffect, useState, useRef } from 'react';
import { Bot, Customer, PricingPlan } from '../types';
import { fetchLivePricing, PricingData } from '../services/pricingService';

interface DashboardHomeProps {
  bots: Bot[];
  customers: Customer[];
  plans: PricingPlan[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ bots, customers, plans }) => {
  const [pricing, setPricing] = useState<PricingData | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- AGGREGATIONS ---
  const totalCalls = bots.reduce((acc, bot) => acc + bot.stats.calls, 0);
  const totalMinutes = bots.reduce((acc, bot) => acc + bot.stats.minutes, 0);
  
  // Financial Intelligence
  // Calculate Google Cost (Production Cost)
  // Assuming average input/output mix for cost estimation
  const estGoogleCost = totalMinutes * (pricing?.blendedRatePerMin || 0.05);

  // Calculate MRR (Monthly Recurring Revenue)
  const mrr = customers.reduce((acc, customer) => {
    const plan = plans.find(p => p.id === customer.planId);
    if (!plan) return acc;
    
    // Base Fee
    let monthly = plan.price;
    // Amortize yearly/one-time just for rough MRR display (simplified)
    if (plan.interval === 'year') monthly = plan.price / 12;
    if (plan.interval === 'one-time') monthly = 0; // Don't count one-time in MRR
    
    // Add active phone number rentals (Logic: if not included and bot has number)
    // Simplified check: if plan doesn't include number, check bots for numbers
    if (!plan.includesPhoneNumber) {
        const customerBots = bots.filter(b => b.customerId === customer.id && b.phoneNumber);
        monthly += customerBots.length * plan.phoneNumberMonthlyPrice;
    }

    return acc + monthly;
  }, 0);

  // --- LIVE DATA SIMULATION ---
  useEffect(() => {
    const loadPrice = async () => {
        try {
            const data = await fetchLivePricing();
            setPricing(data);
        } catch (e) {
            console.error("Failed to fetch pricing");
        } finally {
            setLoadingPrice(false);
        }
    };
    loadPrice();
    const interval = setInterval(loadPrice, 15000); // Faster updates for live feel
    return () => clearInterval(interval);
  }, []);

  // Simulate Live Logs
  useEffect(() => {
    const logInterval = setInterval(() => {
        if (Math.random() > 0.7) { // Random event trigger
            const types: ('info' | 'success' | 'warning')[] = ['info', 'success', 'info', 'info', 'warning'];
            const type = types[Math.floor(Math.random() * types.length)];
            const activeCustomer = customers[Math.floor(Math.random() * customers.length)];
            const messages = [
                `Inbound call started for ${activeCustomer.companyName}`,
                `Webhook trigger: order_status_check`,
                `Twilio Stream connection established`,
                `Voice packet latency > 150ms (jitter)`,
                `Call completed successfully (145s)`
            ];
            
            const newLog: LogEntry = {
                id: Math.random().toString(36),
                timestamp: new Date().toLocaleTimeString(),
                source: 'SYS-CORE',
                message: messages[Math.floor(Math.random() * messages.length)],
                type
            };
            
            setLogs(prev => [...prev.slice(-19), newLog]); // Keep last 20
        }
    }, 2500);
    return () => clearInterval(logInterval);
  }, [customers]);

  useEffect(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="p-8 space-y-8 animate-fade-in pb-20">
      <header className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-white mb-1">Mission Control</h1>
            <p className="text-slate-400">Admin Overview & Production Monitor</p>
        </div>
        <div className="flex gap-4">
             <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 text-xs font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                SYSTEM OPERATIONAL
             </div>
        </div>
      </header>

      {/* --- TOP ROW: FINANCIALS & VOLUME --- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LIVE RATE CARD (SOTA TECH) */}
        <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden group shadow-lg shadow-indigo-500/10">
            <div className="absolute top-0 right-0 p-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                </span>
            </div>
            
            <h3 className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Live Market Rate</h3>
            
            {loadingPrice ? (
                <div className="h-8 w-24 bg-slate-800 rounded animate-pulse mb-1"></div>
            ) : (
                <div className="text-3xl font-bold text-white mb-1 font-mono tracking-tight">
                    ${(pricing?.blendedRatePerMin || 0).toFixed(4)}
                    <span className="text-sm font-sans font-normal text-slate-500 ml-1">/min</span>
                </div>
            )}
            
            <div className="text-xs text-slate-400 mt-2 space-y-1 font-mono">
                <div className="flex justify-between">
                    <span>Combined Input/Output</span>
                </div>
            </div>
        </div>

        {/* EST. REVENUE (MRR) */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Est. Monthly Revenue</h3>
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-1">€{mrr.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div className="text-xs text-slate-500">Based on active plans & rentals</div>
        </div>

        {/* PRODUCTION COST */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Est. Google Cost</h3>
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-1">${estGoogleCost.toFixed(2)}</div>
            <div className="text-xs text-slate-500">Total usage * Live Rate</div>
        </div>

        {/* ACTIVE CUSTOMERS */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Customers</h3>
                <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{customers.filter(c => c.status === 'active').length}</div>
            <div className="text-xs text-slate-500">Across {bots.length} active bots</div>
        </div>
      </div>

      {/* --- MIDDLE ROW: METRICS & HEALTH --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOTAL VOLUME */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-center">
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Total Traffic Volume</h3>
             <div className="grid grid-cols-2 gap-8 text-center">
                <div>
                    <div className="text-4xl font-bold text-white mb-2">{totalCalls.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Total Calls</div>
                </div>
                <div>
                    <div className="text-4xl font-bold text-white mb-2">{totalMinutes.toLocaleString()}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">Minutes Spoken</div>
                </div>
             </div>
        </div>

        {/* GEMINI UNIT COSTS (Detailed Breakdown) */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col justify-center">
             <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Gemini Live Unit Costs</h3>
             <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded text-emerald-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">STT (Input)</div>
                            <div className="text-xs text-slate-500">Audio In / min</div>
                        </div>
                    </div>
                    <div className="text-right font-mono text-emerald-400 font-bold">
                        ${(pricing?.inputRatePerMin || 0).toFixed(5)}
                    </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded text-indigo-400">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">TTS (Output)</div>
                            <div className="text-xs text-slate-500">Audio Out / min</div>
                        </div>
                    </div>
                    <div className="text-right font-mono text-indigo-400 font-bold">
                        ${(pricing?.outputRatePerMin || 0).toFixed(4)}
                    </div>
                </div>
             </div>
        </div>

        {/* ERROR MONITOR */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">System Health</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-24 text-xs text-slate-400 font-mono">API Latency</div>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[25%] rounded-full"></div>
                    </div>
                    <div className="w-12 text-right text-xs text-emerald-400 font-mono">42ms</div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-24 text-xs text-slate-400 font-mono">Error Rate</div>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[0.5%] rounded-full"></div>
                    </div>
                    <div className="w-12 text-right text-xs text-emerald-400 font-mono">0.05%</div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-24 text-xs text-slate-400 font-mono">Active Streams</div>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[65%] rounded-full"></div>
                    </div>
                    <div className="w-12 text-right text-xs text-indigo-400 font-mono">128</div>
                </div>
            </div>
        </div>
      </div>

      {/* --- BOTTOM ROW: LIVE CONSOLE --- */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[300px]">
         <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Live Log Output</span>
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5">
            {logs.length === 0 && <div className="text-slate-600 italic">Waiting for incoming signals...</div>}
            {logs.map((log) => (
                <div key={log.id} className="flex gap-3 animate-fade-in">
                    <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                    <span className="text-indigo-500/70 shrink-0 w-24">{log.source}</span>
                    <span className={`break-all ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warning' ? 'text-amber-400' :
                        log.type === 'success' ? 'text-emerald-400' :
                        'text-slate-300'
                    }`}>
                        {log.message}
                    </span>
                </div>
            ))}
            <div ref={logsEndRef} />
         </div>
      </div>

    </div>
  );
};

export default DashboardHome;
import React from 'react';
import { Bot, Customer, PricingPlan } from '../types';

interface TwilioManagerProps {
  bots: Bot[];
  customers: Customer[];
  plans: PricingPlan[];
}

const TwilioManager: React.FC<TwilioManagerProps> = ({ bots, customers, plans }) => {
  
  // 1. Aggregate Active Numbers
  const activeNumbers = bots
    .filter(bot => bot.phoneNumber)
    .map(bot => {
        const customer = customers.find(c => c.id === bot.customerId);
        const plan = plans.find(p => p.id === customer?.planId);
        
        return {
            id: bot.id,
            number: bot.phoneNumber,
            botName: bot.name,
            customerName: customer?.companyName || 'Unknown',
            customerStatus: customer?.status || 'inactive',
            region: bot.phoneNumber?.startsWith('+49') ? 'DE' : bot.phoneNumber?.startsWith('+43') ? 'AT' : 'US',
            minutesUsed: bot.stats.minutes,
            // Is this number generating rental revenue?
            // If plan does NOT include number, customer pays extra (Revenue)
            rentalRevenue: plan && !plan.includesPhoneNumber ? plan.phoneNumberMonthlyPrice : 0,
            // Est. Cost to YOU (Platform) - Approx $1.15 for number + usage
            platformCost: 1.15 + (bot.stats.minutes * 0.013) // $0.013/min termination approx
        };
    });

  const totalNumbers = activeNumbers.length;
  const totalMinutes = activeNumbers.reduce((acc, curr) => acc + curr.minutesUsed, 0);
  const totalRentalRevenue = activeNumbers.reduce((acc, curr) => acc + curr.rentalRevenue, 0);
  const totalPlatformCost = activeNumbers.reduce((acc, curr) => acc + curr.platformCost, 0);

  return (
    <div className="p-8 h-full flex flex-col animate-fade-in">
      <header className="mb-8 flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-white mb-1">Twilio Inventory</h1>
            <p className="text-slate-400">Overview of active phone numbers, usage, and carrier costs.</p>
        </div>
        <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            LIVE API CONNECTION
        </div>
      </header>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Numbers</div>
            <div className="text-3xl font-bold text-white">{totalNumbers}</div>
            <div className="text-xs text-slate-500 mt-1">Routed to bots</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total Minutes</div>
            <div className="text-3xl font-bold text-sky-400">{totalMinutes.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Current period</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Est. Carrier Cost</div>
            <div className="text-3xl font-bold text-amber-400">${totalPlatformCost.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">Payable to Twilio</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full"></div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Rental Revenue</div>
            <div className="text-3xl font-bold text-emerald-400">€{totalRentalRevenue.toFixed(2)}</div>
            <div className="text-xs text-slate-500 mt-1">From customers</div>
        </div>
      </div>

      {/* --- INVENTORY TABLE --- */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
            <h3 className="font-semibold text-white">Active Numbers Inventory</h3>
            <button className="text-xs text-indigo-400 hover:text-white transition-colors">
                Sync with Twilio
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/30">
                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Number</th>
                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Region</th>
                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned To</th>
                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Usage (Min)</th>
                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan Type</th>
                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Est. Cost</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-sm">
                    {activeNumbers.map((item) => (
                        <tr key={item.number} className="hover:bg-slate-700/30 transition-colors">
                            <td className="p-4 font-mono text-white">{item.number}</td>
                            <td className="p-4 text-slate-400">{item.region}</td>
                            <td className="p-4">
                                <div className="text-white font-medium">{item.customerName}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.customerStatus === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                                    {item.botName}
                                </div>
                            </td>
                            <td className="p-4 text-slate-300">{item.minutesUsed}</td>
                            <td className="p-4">
                                {item.rentalRevenue > 0 ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                        Rented (€{item.rentalRevenue})
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                        Included
                                    </span>
                                )}
                            </td>
                            <td className="p-4 text-right font-mono text-amber-400/80">
                                ${item.platformCost.toFixed(3)}
                            </td>
                        </tr>
                    ))}
                    {activeNumbers.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 italic">
                                No active numbers found. Provision numbers in the Customer view.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default TwilioManager;
import React, { useState } from 'react';
import { Customer, Bot, PricingPlan } from '../types';
import BotList from './BotList';

interface CustomerDetailProps {
  customer: Customer;
  bots: Bot[];
  onBack: () => void;
  onBotSelect: (bot: Bot) => void;
  onBotCreate: () => void;
  onBotDelete: (id: string) => void;
  onAssignNumber: (bot: Bot, customer: Customer, plan: PricingPlan) => void;
  onConfigureWebhook?: (bot: Bot, phoneNumber: string) => void;
  plans: PricingPlan[];
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ 
  customer, bots, onBack, onBotSelect, onBotCreate, onBotDelete, onAssignNumber, onConfigureWebhook, plans 
}) => {
  const [activeTab, setActiveTab] = useState<'stammdaten' | 'zahlung' | 'bots' | 'abrechnung'>('stammdaten');

  // Calculate aggregates
  const totalCalls = bots.reduce((acc, bot) => acc + bot.stats.calls, 0);
  const totalMinutes = bots.reduce((acc, bot) => acc + bot.stats.minutes, 0);

  // Billing calculation
  const currentPlan = plans.find(p => p.id === customer.planId);
  // Default values if stats are missing
  const usedMin = customer.billingStats?.usedMinutes || 0;
  const includedMin = currentPlan?.includedMinutes || 0;
  const bonusMin = customer.signupBonusRemaining || 0;
  
  // Logic: First use bonus, then included, then overage
  // This is a simplified display logic. Real billing logic would be more complex.
  const totalAvailableFree = includedMin + bonusMin;
  const isOverLimit = usedMin > totalAvailableFree;
  const overageMinutes = Math.max(0, usedMin - totalAvailableFree);
  const overageCost = overageMinutes * (currentPlan?.overageRatePerMinute || 0);
  const currentTotal = (customer.billingStats?.baseFee || 0) + overageCost;


  return (
    <div className="h-full flex flex-col bg-slate-900 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div>
                <h1 className="text-xl font-bold text-white">{customer.companyName}</h1>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>Kunden-Nr: {customer.id}</span>
                    <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                    <span className="text-emerald-400">Aktiv</span>
                </div>
            </div>
        </div>

        {/* Aggregated Stats Section */}
        <div className="flex items-center gap-8 px-4 border-l border-slate-700/50">
            <div className="text-right">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Active Bots</div>
                <div className="text-2xl font-bold text-white leading-none">{bots.length}</div>
            </div>
            <div className="text-right">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total Calls</div>
                <div className="text-2xl font-bold text-indigo-300 leading-none">{totalCalls}</div>
            </div>
            <div className="text-right">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">Minutes</div>
                <div className="text-2xl font-bold text-emerald-300 leading-none">{totalMinutes}</div>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 px-6 flex gap-6 bg-slate-800/50">
        <button 
            onClick={() => setActiveTab('stammdaten')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'stammdaten' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            Stammdaten
        </button>
        <button 
            onClick={() => setActiveTab('zahlung')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'zahlung' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            Zahlungsdaten
        </button>
        <button 
            onClick={() => setActiveTab('bots')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bots' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            Bots ({bots.length})
        </button>
        <button 
            onClick={() => setActiveTab('abrechnung')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'abrechnung' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
            Abrechnung & Verbrauch
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'stammdaten' && (
            <div className="max-w-2xl space-y-6 animate-fade-in">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 uppercase font-semibold">Firmenname</label>
                        <input type="text" readOnly value={customer.companyName} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-slate-200" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 uppercase font-semibold">UID-Nummer</label>
                        <input type="text" readOnly value={customer.vatId} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-slate-200" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 uppercase font-semibold">Kontaktperson</label>
                        <input type="text" readOnly value={customer.contactName} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-slate-200" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 uppercase font-semibold">Email</label>
                        <input type="text" readOnly value={customer.email} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-slate-200" />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <label className="text-xs text-slate-500 uppercase font-semibold">Adresse</label>
                        <input type="text" readOnly value={customer.address} className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-slate-200" />
                    </div>

                    <div className="space-y-1">
                         <label className="text-xs text-slate-500 uppercase font-semibold">Aktiver Plan</label>
                         <input 
                            type="text" 
                            readOnly 
                            value={currentPlan?.name || 'Kein Plan'} 
                            className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-indigo-400 font-medium" 
                        />
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'zahlung' && (
            <div className="max-w-2xl animate-fade-in">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-start gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-white mb-1">
                            {customer.paymentMethod.type === 'credit_card' ? 'Kreditkarte' : 'Rechnung'}
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                            {customer.paymentMethod.details}
                        </p>
                        <div className="flex gap-2">
                             <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">Gültig</span>
                             <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">Standard</span>
                        </div>
                    </div>
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">Bearbeiten</button>
                </div>
            </div>
        )}

        {activeTab === 'bots' && (
            <div className="h-full animate-fade-in">
                <BotList 
                    bots={bots} 
                    customer={customer}
                    plans={plans}
                    onSelect={onBotSelect} 
                    onCreate={onBotCreate}
                    onDelete={onBotDelete}
                    onAssignNumber={onAssignNumber}
                    onConfigureWebhook={onConfigureWebhook}
                />
            </div>
        )}

        {activeTab === 'abrechnung' && (
            <div className="space-y-8 animate-fade-in">
                {/* Usage Visualization */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                             <h3 className="text-lg font-medium text-white">Verbrauchter Zeitraum</h3>
                             <p className="text-slate-400 text-sm">
                                {customer.billingStats?.currentPeriodStart} bis {customer.billingStats?.currentPeriodEnd}
                             </p>
                        </div>
                        <div className="text-right">
                            <span className={`text-2xl font-bold ${isOverLimit ? 'text-red-400' : 'text-white'}`}>
                                {usedMin}
                            </span>
                            <span className="text-slate-500 text-sm"> / {totalAvailableFree} min</span>
                        </div>
                    </div>

                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${isOverLimit ? 'bg-red-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min(100, (usedMin / (totalAvailableFree || 1)) * 100)}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>0 min</span>
                        <span>{totalAvailableFree} min (Included + Bonus)</span>
                    </div>
                </div>

                {/* Live Invoice Preview */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-6">Vorläufige Rechnung</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-slate-300 text-sm">
                            <span>Basispreis ({currentPlan?.name})</span>
                            <span>€{customer.billingStats?.baseFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-300 text-sm">
                            <span>Überzug ({overageMinutes} min x €{currentPlan?.overageRatePerMinute})</span>
                            <span>€{overageCost.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between text-slate-300 text-sm">
                            <span>Telefonnummern</span>
                            <span>€0.00</span> 
                        </div>
                        <div className="border-t border-slate-700 pt-3 flex justify-between text-white font-bold text-lg">
                            <span>Gesamt (exkl. USt)</span>
                            <span>€{currentTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Call History */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                     <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                        <h3 className="font-medium text-white">Einzelverbindungsnachweis</h3>
                     </div>
                     <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 text-slate-400">
                            <tr>
                                <th className="p-4">Zeitstempel</th>
                                <th className="p-4">Richtung</th>
                                <th className="p-4">Nummer</th>
                                <th className="p-4">Dauer</th>
                                <th className="p-4 text-right">Kosten</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {(customer.callHistory || []).map(call => (
                                <tr key={call.id} className="hover:bg-slate-700/20">
                                    <td className="p-4 text-slate-300">{new Date(call.timestamp).toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs ${call.direction === 'inbound' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            {call.direction}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-300 font-mono">{call.phoneNumber}</td>
                                    <td className="p-4 text-slate-300">{call.durationSeconds}s</td>
                                    <td className="p-4 text-right text-slate-300">€{call.cost.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
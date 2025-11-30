import React, { useState, useEffect } from 'react';
import { Bot, Customer, PricingPlan } from '../types';
import { searchAvailableNumbers, AvailableNumber } from '../services/twilioService';

interface NumberProvisioningModalProps {
  bot: Bot;
  customer: Customer;
  plan: PricingPlan;
  onClose: () => void;
  onAssign: (number: string) => void;
  onConfigureWebhook: (number: string) => void;
}

const NumberProvisioningModal: React.FC<NumberProvisioningModalProps> = ({ 
  bot, customer, plan, onClose, onAssign, onConfigureWebhook 
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'manual'>('search');
  
  // Search State
  const [country, setCountry] = useState('DE');
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null);

  // Manual State
  const [manualNumber, setManualNumber] = useState('');
  const [configuring, setConfiguring] = useState(false);

  useEffect(() => {
    if (activeTab === 'search') {
        loadNumbers();
    }
  }, [country, activeTab]);

  const loadNumbers = async () => {
    setLoading(true);
    const nums = await searchAvailableNumbers(country);
    setAvailableNumbers(nums);
    setLoading(false);
  };

  const handleBuy = () => {
    if (selectedNumber) {
        onAssign(selectedNumber.phoneNumber);
        onClose();
    }
  };

  const handleManualWebhook = async () => {
    if (!manualNumber) return;
    setConfiguring(true);
    await onConfigureWebhook(manualNumber);
    setConfiguring(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
            <div>
                <h3 className="text-xl font-bold text-white">Phone Number Assignment</h3>
                <p className="text-xs text-slate-400">Manage connection for <span className="text-indigo-400">{bot.name}</span></p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className="flex border-b border-slate-700">
            <button 
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'search' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500' : 'bg-slate-900/30 text-slate-400 hover:bg-slate-800'}`}
            >
                Twilio Search (Auto-Provision)
            </button>
            <button 
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'manual' ? 'bg-slate-800 text-indigo-400 border-b-2 border-indigo-500' : 'bg-slate-900/30 text-slate-400 hover:bg-slate-800'}`}
            >
                Manual Input / BYO
            </button>
        </div>

        <div className="p-6 min-h-[300px]">
            {activeTab === 'search' && (
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <select 
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-indigo-500"
                        >
                            <option value="DE">Germany (+49)</option>
                            <option value="AT">Austria (+43)</option>
                            <option value="US">United States (+1)</option>
                        </select>
                        <button onClick={loadNumbers} className="text-slate-400 hover:text-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">
                                <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <div>Searching Twilio Inventory...</div>
                            </div>
                        ) : availableNumbers.map((num) => (
                            <div 
                                key={num.phoneNumber}
                                onClick={() => setSelectedNumber(num)}
                                className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                                    selectedNumber?.phoneNumber === num.phoneNumber
                                    ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                                    : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                                }`}
                            >
                                <div>
                                    <div className="font-mono text-white text-lg">{num.phoneNumber}</div>
                                    <div className="text-xs text-slate-500">{num.locality}, {num.isoCountry}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-bold ${plan.includesPhoneNumber ? 'text-emerald-400' : 'text-slate-200'}`}>
                                        {plan.includesPhoneNumber ? 'Included' : `€${plan.phoneNumberMonthlyPrice}/mo`}
                                    </div>
                                    <div className="text-xs text-slate-500">Monthly</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedNumber && (
                        <div className="pt-4 border-t border-slate-700 flex justify-end">
                             <button 
                                onClick={handleBuy}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/20"
                             >
                                {plan.includesPhoneNumber ? 'Claim Number' : 'Rent Number'}
                             </button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'manual' && (
                <div className="space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-amber-200 text-sm">
                        Use this if you already own a number on Twilio or another provider. 
                        We will attempt to configure the webhook automatically.
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Phone Number</label>
                        <input 
                            type="text" 
                            value={manualNumber}
                            onChange={(e) => setManualNumber(e.target.value)}
                            placeholder="+49 123 456789"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-white text-lg font-mono focus:border-indigo-500 outline-none" 
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                         <button 
                            onClick={handleManualWebhook}
                            disabled={!manualNumber || configuring}
                            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                                !manualNumber || configuring
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                            }`}
                         >
                            {configuring ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Configuring API...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    Webhook setzen
                                </>
                            )}
                         </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default NumberProvisioningModal;
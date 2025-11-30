
import React, { useState } from 'react';
import { PricingPlan } from '../types';

interface PricingManagerProps {
  plans: PricingPlan[];
  onSavePlan: (plan: PricingPlan) => void;
  onDeletePlan: (id: string) => void;
}

const PricingManager: React.FC<PricingManagerProps> = ({ plans, onSavePlan, onDeletePlan }) => {
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);

  const handleCreate = () => {
    const newPlan: PricingPlan = {
      id: `plan_${Date.now()}`,
      name: 'New Plan',
      price: 0,
      currency: 'EUR',
      interval: 'month',
      includedMinutes: 0,
      signupBonusMinutes: 0,
      overageRatePerMinute: 0.25,
      maxConcurrentLines: 1,
      includesPhoneNumber: false,
      phoneNumberMonthlyPrice: 15,
      extraLineMonthlyPrice: 50,
      features: ['Basic Support'],
      stripeProductId: ''
    };
    setEditingPlan(newPlan);
  };

  const handleFeatureChange = (text: string) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: text.split('\n').filter(line => line.trim() !== '')
    });
  };

  return (
    <div className="h-full flex flex-col p-8 animate-fade-in relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Pricing Packages</h1>
          <p className="text-slate-400">Manage your SaaS plans and Stripe connections.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto pb-8">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`bg-slate-800 border ${plan.isPopular ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-slate-700'} rounded-2xl p-6 flex flex-col relative group`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Most Popular
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                   onClick={() => setEditingPlan(plan)}
                   className="p-1.5 hover:bg-slate-700 rounded text-indigo-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button 
                   onClick={() => onDeletePlan(plan.id)}
                   className="p-1.5 hover:bg-slate-700 rounded text-red-400"
                >
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                </button>
              </div>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-white">€{plan.price}</span>
              {plan.interval !== 'one-time' && <span className="text-slate-400">/{plan.interval}</span>}
            </div>

            <div className="space-y-4 flex-1">
              {/* Included Minutes */}
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded bg-slate-700/50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="font-bold text-white">{plan.includedMinutes}</span> Free / Mo
                  {plan.signupBonusMinutes > 0 && <div className="text-xs text-slate-500">+ {plan.signupBonusMinutes} Signup Bonus</div>}
                </div>
              </div>

              {/* Overage Rate */}
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded bg-slate-700/50 flex items-center justify-center shrink-0">
                   <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                </div>
                <div>
                  <span className="font-bold text-white">€{plan.overageRatePerMinute.toFixed(2)}</span> / extra min
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-8 h-8 rounded bg-slate-700/50 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  {plan.includesPhoneNumber ? (
                      <span className="text-green-400 font-bold">Number Included</span>
                  ) : (
                      <span>Rent: <span className="text-white">€{plan.phoneNumberMonthlyPrice}</span>/mo</span>
                  )}
                </div>
              </div>
              
              <div className="border-t border-slate-700 pt-4">
                 <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                             <svg className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                        </li>
                    ))}
                 </ul>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-slate-500 font-mono break-all">
                Stripe: {plan.stripeProductId || 'Not connected'}
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingPlan && (
        <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Edit Package</h2>
                    <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-8 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Plan Name</label>
                            <input 
                                type="text" 
                                value={editingPlan.name} 
                                onChange={e => setEditingPlan({...editingPlan, name: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Price (EUR)</label>
                            <input 
                                type="number" 
                                value={editingPlan.price} 
                                onChange={e => setEditingPlan({...editingPlan, price: parseFloat(e.target.value)})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Interval</label>
                            <select 
                                value={editingPlan.interval}
                                onChange={e => setEditingPlan({...editingPlan, interval: e.target.value as any})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="month">Monthly</option>
                                <option value="year">Yearly</option>
                                <option value="one-time">One-Time</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Included Minutes (Recurring)</label>
                            <input 
                                type="number" 
                                value={editingPlan.includedMinutes} 
                                onChange={e => setEditingPlan({...editingPlan, includedMinutes: parseInt(e.target.value)})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Overage Rate (EUR/min)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={editingPlan.overageRatePerMinute} 
                                onChange={e => setEditingPlan({...editingPlan, overageRatePerMinute: parseFloat(e.target.value)})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                            />
                            <p className="text-xs text-slate-500 mt-1">Charged automatically via Stripe for minutes exceeding limits.</p>
                        </div>
                        
                         <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Signup Bonus Minutes (One-time)</label>
                            <input 
                                type="number" 
                                value={editingPlan.signupBonusMinutes} 
                                onChange={e => setEditingPlan({...editingPlan, signupBonusMinutes: parseInt(e.target.value)})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Max Lines (Default)</label>
                            <input 
                                type="number" 
                                value={editingPlan.maxConcurrentLines} 
                                onChange={e => setEditingPlan({...editingPlan, maxConcurrentLines: parseInt(e.target.value)})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Extra Line Price (EUR/mo)</label>
                            <input 
                                type="number" 
                                value={editingPlan.extraLineMonthlyPrice || 0} 
                                onChange={e => setEditingPlan({...editingPlan, extraLineMonthlyPrice: parseFloat(e.target.value)})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                            />
                            <p className="text-xs text-slate-500 mt-1">Cost for customers to buy additional capacity.</p>
                        </div>

                        <div className="bg-slate-700/30 p-4 rounded-lg col-span-2 border border-slate-700">
                             <div className="flex items-center gap-2 mb-4">
                                <input 
                                    type="checkbox" 
                                    id="includesPhone"
                                    checked={editingPlan.includesPhoneNumber}
                                    onChange={e => setEditingPlan({...editingPlan, includesPhoneNumber: e.target.checked})}
                                    className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                                />
                                <label htmlFor="includesPhone" className="text-sm font-medium text-white select-none">
                                    Includes Phone Number
                                </label>
                             </div>
                             
                             {!editingPlan.includesPhoneNumber && (
                                 <div>
                                    <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Rental Price (EUR/mo)</label>
                                    <input 
                                        type="number" 
                                        value={editingPlan.phoneNumberMonthlyPrice} 
                                        onChange={e => setEditingPlan({...editingPlan, phoneNumberMonthlyPrice: parseFloat(e.target.value)})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" 
                                    />
                                    <p className="text-xs text-slate-500 mt-1">Customers will pay this amount extra to rent a number.</p>
                                 </div>
                             )}
                        </div>
                        
                        <div className="col-span-2">
                             <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Features (One per line)</label>
                             <textarea 
                                value={editingPlan.features.join('\n')}
                                onChange={e => handleFeatureChange(e.target.value)}
                                rows={4}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none resize-none font-mono text-sm"
                             />
                        </div>
                        
                        <div className="col-span-2 pt-4 border-t border-slate-700">
                            <label className="block text-xs font-semibold text-indigo-400 uppercase mb-1 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                                Stripe Product ID
                            </label>
                            <input 
                                type="text" 
                                value={editingPlan.stripeProductId} 
                                onChange={e => setEditingPlan({...editingPlan, stripeProductId: e.target.value})}
                                placeholder="prod_..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none font-mono" 
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3">
                    <button onClick={() => setEditingPlan(null)} className="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
                    <button 
                        onClick={() => {
                            if (editingPlan) onSavePlan(editingPlan);
                            setEditingPlan(null);
                        }}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20"
                    >
                        Save Package
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default PricingManager;

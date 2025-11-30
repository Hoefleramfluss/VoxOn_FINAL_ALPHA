
import React, { useState } from 'react';
import { api } from '../services/api';

interface RegisterPageProps {
    onRegister: () => void;
    onGoToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onGoToLogin }) => {
    const [formData, setFormData] = useState({
        company: '',
        email: '',
        password: '',
        newsletter: true,
        addonLines: false,
        addonNumber: false
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return;

        setIsLoading(true);
        try {
            // Call Backend API
            const result = await api.registerUser({
                company: formData.company,
                email: formData.email,
                addonLines: formData.addonLines,
                addonNumber: formData.addonNumber
            });

            if (result.success) {
                if (result.checkoutUrl) {
                    // Redirect to Stripe if Payment is needed
                    window.location.href = result.checkoutUrl;
                } else {
                    // Standard success
                    alert("Account created! Please check your email.");
                    onRegister(); // Switch to dashboard or login
                }
            } else {
                alert("Registration failed: " + (result.message || "Unknown error"));
            }
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Create your Account</h1>
                    <p className="text-slate-400">Start building your Voice AI workforce today.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Company Name</label>
                        <input 
                            type="text" 
                            required
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                            placeholder="Acme Corp"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                            placeholder="name@company.com"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Password</label>
                        <input 
                            type="password" 
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* UPSELLING SECTION */}
                    <div className="col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Power-Up your Plan (Optional)
                        </h3>
                        
                        <label className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={formData.addonLines}
                                onChange={(e) => setFormData({...formData, addonLines: e.target.checked})}
                                className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-600" 
                            />
                            <div>
                                <div className="text-white font-medium text-sm">Add 2 Extra Concurrent Lines</div>
                                <div className="text-slate-400 text-xs">+ €50 / month</div>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer hover:border-indigo-500 transition-colors">
                            <input 
                                type="checkbox" 
                                checked={formData.addonNumber}
                                onChange={(e) => setFormData({...formData, addonNumber: e.target.checked})}
                                className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-600" 
                            />
                            <div>
                                <div className="text-white font-medium text-sm">Reserve Premium Number</div>
                                <div className="text-slate-400 text-xs">+ €15 / month</div>
                            </div>
                        </label>
                    </div>

                    <div className="col-span-2">
                        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                             <input 
                                type="checkbox" 
                                checked={formData.newsletter}
                                onChange={(e) => setFormData({...formData, newsletter: e.target.checked})}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-600" 
                            />
                            I want to receive product updates and the newsletter.
                        </label>
                    </div>

                    <div className="col-span-2 pt-4">
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 transition-all transform hover:scale-[1.01] flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center text-sm">
                    <p className="text-slate-400">
                        Already have an account?{' '}
                        <button onClick={onGoToLogin} className="text-indigo-400 hover:text-indigo-300 font-medium">
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

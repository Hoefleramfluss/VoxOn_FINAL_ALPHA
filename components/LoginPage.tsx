
import React, { useState } from 'react';

interface LoginPageProps {
    onLogin: () => void;
    onGoToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGoToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [forgotPassword, setForgotPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock authentication
        if (email && (password || forgotPassword)) {
            if (forgotPassword) {
                alert(`Password reset link sent to ${email}`);
                setForgotPassword(false);
            } else {
                onLogin();
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 items-center justify-center text-white font-bold text-xl mb-4">
                        V
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {forgotPassword ? 'Reset Password' : 'Welcome Back'}
                    </h1>
                    <p className="text-slate-400 mt-2 text-sm">
                        {forgotPassword 
                            ? 'Enter your email to receive a recovery link.' 
                            : 'Sign in to access your VoiceOmni Dashboard.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors"
                            placeholder="name@company.com"
                        />
                    </div>

                    {!forgotPassword && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-semibold text-slate-400 uppercase">Password</label>
                                <button 
                                    type="button"
                                    onClick={() => setForgotPassword(true)}
                                    className="text-xs text-indigo-400 hover:text-indigo-300"
                                >
                                    Forgot password?
                                </button>
                            </div>
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <button 
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-[1.02]"
                    >
                        {forgotPassword ? 'Send Reset Link' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    {forgotPassword ? (
                        <button onClick={() => setForgotPassword(false)} className="text-slate-400 hover:text-white">
                            Back to Login
                        </button>
                    ) : (
                        <p className="text-slate-400">
                            Don't have an account?{' '}
                            <button onClick={onGoToRegister} className="text-indigo-400 hover:text-indigo-300 font-medium">
                                Create Account
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

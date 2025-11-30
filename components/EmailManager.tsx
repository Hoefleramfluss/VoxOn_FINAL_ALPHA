
import React, { useState } from 'react';
import { EmailTemplate } from '../types';

const INITIAL_TEMPLATES: EmailTemplate[] = [
    { id: 'tpl_welcome', name: 'Welcome Email', subject: 'Welcome to VoiceOmni!', body: '<h1>Hi {{name}},</h1><p>Welcome aboard...</p>', type: 'welcome', lastUpdated: new Date().toISOString() },
    { id: 'tpl_reset', name: 'Password Reset', subject: 'Reset your password', body: '<p>Click here to reset...</p>', type: 'reset_password', lastUpdated: new Date().toISOString() },
    { id: 'tpl_news', name: 'Monthly Newsletter', subject: 'VoiceOmni Updates - October', body: '<h1>New Features</h1>...', type: 'newsletter', lastUpdated: new Date().toISOString() },
];

const EmailManager: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>(INITIAL_TEMPLATES);
    const [activeTemplate, setActiveTemplate] = useState<EmailTemplate | null>(null);
    const [isSending, setIsSending] = useState(false);

    const handleSendNewsletter = async () => {
        if (!confirm('Send this newsletter to all subscribed users?')) return;
        setIsSending(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 2000));
        setIsSending(false);
        alert('Newsletter sent successfully to 1,240 recipients.');
    };

    return (
        <div className="p-8 h-full flex flex-col animate-fade-in">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Email Manager</h1>
                    <p className="text-slate-400">Manage templates and send marketing emails via Gmail API.</p>
                </div>
            </header>

            <div className="flex gap-6 flex-1 overflow-hidden">
                {/* LIST */}
                <div className="w-1/3 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-4 bg-slate-900/50 border-b border-slate-700 font-semibold text-white">Templates</div>
                    <div className="flex-1 overflow-y-auto">
                        {templates.map(t => (
                            <div 
                                key={t.id} 
                                onClick={() => setActiveTemplate(t)}
                                className={`p-4 border-b border-slate-700 cursor-pointer hover:bg-slate-700/50 ${activeTemplate?.id === t.id ? 'bg-indigo-600/10 border-l-4 border-l-indigo-500' : ''}`}
                            >
                                <div className="text-white font-medium">{t.name}</div>
                                <div className="text-xs text-slate-500 mt-1">{t.subject}</div>
                                <div className="mt-2 inline-flex text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                    {t.type}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* EDITOR */}
                <div className="flex-1 bg-slate-800 border border-slate-700 rounded-xl flex flex-col overflow-hidden">
                    {activeTemplate ? (
                        <>
                            <div className="p-6 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
                                <div className="flex-1 mr-4">
                                    <label className="block text-xs text-slate-500 uppercase font-bold mb-1">Subject Line</label>
                                    <input 
                                        type="text" 
                                        value={activeTemplate.subject}
                                        onChange={(e) => setActiveTemplate({...activeTemplate, subject: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white outline-none focus:border-indigo-500"
                                    />
                                </div>
                                {activeTemplate.type === 'newsletter' && (
                                    <button 
                                        onClick={handleSendNewsletter}
                                        disabled={isSending}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold flex items-center gap-2"
                                    >
                                        {isSending ? 'Sending...' : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                                Send Blast
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 p-0">
                                <textarea 
                                    value={activeTemplate.body}
                                    onChange={(e) => setActiveTemplate({...activeTemplate, body: e.target.value})}
                                    className="w-full h-full bg-slate-950 p-6 text-slate-300 font-mono text-sm outline-none resize-none"
                                />
                            </div>
                            <div className="p-4 bg-slate-900 border-t border-slate-700 text-right">
                                <button className="px-4 py-2 text-slate-400 hover:text-white mr-2">Preview</button>
                                <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium">Save Changes</button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            Select a template to edit
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmailManager;

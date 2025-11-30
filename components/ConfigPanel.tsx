
import React, { useState } from 'react';
import { Bot, VoiceName, ToolTemplate } from '../types';
import { GoogleGenAI } from "@google/genai";
import config from '../config';

// --- ICONS ---
const Icons = {
    Resmio: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Calendar: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    CRM: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Webhook: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Shop: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>,
    Support: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Zap: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Sheet: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
};

// --- SOTA TOOL LIBRARY ---
const TOOL_TEMPLATES: ToolTemplate[] = [
    // --- 1. RESERVATIONS (Enhanced Resmio) ---
    {
        id: 'resmio_suite',
        name: 'Resmio Full Suite',
        description: 'Check availability, create bookings, and cancel reservations via Resmio.',
        category: 'booking',
        icon: Icons.Resmio,
        fields: [
            { key: 'restaurantId', label: 'Resmio Restaurant ID', type: 'text', placeholder: 'e.g. central-cafe-wien' },
            { key: 'apiKey', label: 'API Key (Optional)', type: 'password', helperText: 'Required for private bookings.' }
        ],
        generate: (inputs) => ([
            {
                name: 'resmio_check_availability',
                description: `Checks for available table slots at restaurant ${inputs.restaurantId}.`,
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        date: { type: 'STRING', description: 'Date in YYYY-MM-DD format' },
                        time: { type: 'STRING', description: 'Target time in HH:MM' },
                        people: { type: 'NUMBER', description: 'Number of guests' }
                    },
                    required: ['date', 'time', 'people']
                }
            },
            {
                name: 'resmio_create_booking',
                description: `Books a table at ${inputs.restaurantId}. Ask for confirmation before calling.`,
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        date: { type: 'STRING', description: 'YYYY-MM-DD' },
                        time: { type: 'STRING', description: 'HH:MM' },
                        people: { type: 'NUMBER', description: 'Guest count' },
                        name: { type: 'STRING', description: 'Customer name' },
                        phone: { type: 'STRING', description: 'Customer phone' },
                        email: { type: 'STRING', description: 'Customer email' }
                    },
                    required: ['date', 'time', 'people', 'name', 'phone']
                }
            },
            {
                name: 'resmio_cancel_booking',
                description: `Cancels an existing reservation at ${inputs.restaurantId}.`,
                parameters: {
                    type: 'OBJECT',
                    properties: {
                        bookingId: { type: 'STRING', description: 'The unique booking ID provided by the user' }
                    },
                    required: ['bookingId']
                }
            }
        ])
    },

    // --- 2. CALENDAR (Calendly) ---
    {
        id: 'calendly',
        name: 'Calendly Scheduler',
        description: 'Generate booking links or check slot availability.',
        category: 'calendar',
        icon: Icons.Calendar,
        fields: [
            { key: 'apiKey', label: 'Personal Access Token', type: 'password' },
            { key: 'userUri', label: 'User URI', type: 'text', placeholder: 'https://api.calendly.com/users/...' }
        ],
        generate: (inputs) => ({
            name: 'check_calendly_slots',
            description: 'Retrieves available appointment slots from Calendly.',
            parameters: {
                type: 'OBJECT',
                properties: {
                    startTime: { type: 'STRING', description: 'Start of range (ISO8601)' },
                    endTime: { type: 'STRING', description: 'End of range (ISO8601)' }
                },
                required: ['startTime', 'endTime']
            }
        })
    },

    // --- 3. CRM (Salesforce) ---
    {
        id: 'salesforce',
        name: 'Salesforce CRM',
        description: 'Create Leads or lookup Contacts in Salesforce.',
        category: 'crm',
        icon: Icons.CRM,
        fields: [
            { key: 'instanceUrl', label: 'Instance URL', type: 'text', placeholder: 'https://your-domain.my.salesforce.com' },
            { key: 'apiVersion', label: 'API Version', type: 'text', placeholder: 'v57.0' }
        ],
        generate: (inputs) => ({
            name: 'create_salesforce_lead',
            description: 'Creates a new Lead object in Salesforce.',
            parameters: {
                type: 'OBJECT',
                properties: {
                    firstName: { type: 'STRING', description: 'Lead First Name' },
                    lastName: { type: 'STRING', description: 'Lead Last Name' },
                    company: { type: 'STRING', description: 'Company Name' },
                    email: { type: 'STRING', description: 'Email Address' }
                },
                required: ['lastName', 'company', 'email']
            }
        })
    },

    // --- 4. CRM (HubSpot) ---
    {
        id: 'hubspot',
        name: 'HubSpot CRM',
        description: 'Manage contacts and deals.',
        category: 'crm',
        icon: Icons.CRM,
        fields: [{ key: 'portalId', label: 'HubSpot Portal ID', type: 'text' }],
        generate: (inputs) => ({
            name: 'hubspot_create_contact',
            description: `Creates a contact in HubSpot Portal ${inputs.portalId}`,
            parameters: {
                type: 'OBJECT',
                properties: {
                    email: { type: 'STRING' },
                    firstname: { type: 'STRING' },
                    phone: { type: 'STRING' }
                },
                required: ['email']
            }
        })
    },

    // --- 5. AUTOMATION (Zapier) ---
    {
        id: 'zapier_catch',
        name: 'Zapier Webhook',
        description: 'Trigger any Zapier workflow (Universal Adapter).',
        category: 'utility',
        icon: Icons.Zap,
        fields: [{ key: 'hookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://hooks.zapier.com/...' }],
        generate: (inputs) => ({
            name: 'trigger_zapier_workflow',
            description: `Sends data to Zapier workflow at ${inputs.hookUrl}`,
            parameters: {
                type: 'OBJECT',
                properties: {
                    action: { type: 'STRING', description: 'What action triggered this?' },
                    data: { type: 'STRING', description: 'Any relevant data to pass' }
                },
                required: ['action']
            }
        })
    },

    // --- 6. AUTOMATION (Make.com) ---
    {
        id: 'make_integromat',
        name: 'Make.com Scenario',
        description: 'Trigger complex scenarios on Make (formerly Integromat).',
        category: 'utility',
        icon: Icons.Zap,
        fields: [{ key: 'hookUrl', label: 'Custom Webhook URL', type: 'text' }],
        generate: (inputs) => ({
            name: 'trigger_make_scenario',
            description: 'Triggers a Make.com scenario with collected data.',
            parameters: {
                type: 'OBJECT',
                properties: {
                    summary: { type: 'STRING', description: 'Summary of user request' },
                    details: { type: 'OBJECT', description: 'Detailed key-value pairs' }
                },
                required: ['summary']
            }
        })
    },

    // --- 7. E-COMMERCE (Shopify) ---
    {
        id: 'shopify',
        name: 'Shopify Store',
        description: 'Check order status and product inventory.',
        category: 'ecommerce',
        icon: Icons.Shop,
        fields: [
            { key: 'shopUrl', label: 'Shop URL', type: 'text', placeholder: 'my-store.myshopify.com' },
            { key: 'accessToken', label: 'Admin Access Token', type: 'password' }
        ],
        generate: (inputs) => ({
            name: 'shopify_get_order',
            description: `Fetches order details from ${inputs.shopUrl}`,
            parameters: {
                type: 'OBJECT',
                properties: {
                    orderNumber: { type: 'STRING', description: 'The order number (e.g. #1001)' },
                    email: { type: 'STRING', description: 'Customer email for verification' }
                },
                required: ['orderNumber']
            }
        })
    },

    // --- 8. E-COMMERCE (WooCommerce) ---
    {
        id: 'woocommerce',
        name: 'WooCommerce',
        description: 'Manage orders for WordPress sites.',
        category: 'ecommerce',
        icon: Icons.Shop,
        fields: [
            { key: 'url', label: 'Site URL', type: 'text' },
            { key: 'consumerKey', label: 'Consumer Key', type: 'password' }
        ],
        generate: (inputs) => ({
            name: 'woo_check_order',
            description: `Checks order status on ${inputs.url}`,
            parameters: {
                type: 'OBJECT',
                properties: {
                    orderId: { type: 'NUMBER' }
                },
                required: ['orderId']
            }
        })
    },

    // --- 9. SUPPORT (Zendesk) ---
    {
        id: 'zendesk',
        name: 'Zendesk Support',
        description: 'Create support tickets or check status.',
        category: 'support',
        icon: Icons.Support,
        fields: [
            { key: 'subdomain', label: 'Zendesk Subdomain', type: 'text', placeholder: 'mycompany' },
            { key: 'email', label: 'Agent Email', type: 'text' }
        ],
        generate: (inputs) => ({
            name: 'create_zendesk_ticket',
            description: `Creates a new ticket in ${inputs.subdomain}.zendesk.com`,
            parameters: {
                type: 'OBJECT',
                properties: {
                    subject: { type: 'STRING', description: 'Ticket subject' },
                    description: { type: 'STRING', description: 'Problem description' },
                    priority: { type: 'STRING', enum: ['low', 'normal', 'high', 'urgent'] }
                },
                required: ['subject', 'description']
            }
        })
    },

    // --- 10. CALENDAR (Outlook/Graph) ---
    {
        id: 'outlook',
        name: 'Microsoft Outlook',
        description: 'Check availability via Microsoft Graph API.',
        category: 'calendar',
        icon: Icons.Calendar,
        fields: [{ key: 'tenantId', label: 'Tenant ID', type: 'text' }],
        generate: (inputs) => ({
            name: 'outlook_find_meeting_times',
            description: 'Finds available meeting times in Outlook Calendar.',
            parameters: {
                type: 'OBJECT',
                properties: {
                    attendees: { type: 'ARRAY', description: 'List of email addresses' },
                    duration: { type: 'NUMBER', description: 'Duration in minutes' }
                },
                required: ['attendees']
            }
        })
    },

    // --- 11. COMMUNICATION (Slack) ---
    {
        id: 'slack_notify',
        name: 'Slack Notification',
        description: 'Send alerts to a Slack channel.',
        category: 'utility',
        icon: Icons.Webhook,
        fields: [{ key: 'webhookUrl', label: 'Slack Webhook URL', type: 'password' }],
        generate: (inputs) => ({
            name: 'send_slack_alert',
            description: 'Posts a message to the configured Slack channel.',
            parameters: {
                type: 'OBJECT',
                properties: {
                    message: { type: 'STRING', description: 'The message content' },
                    severity: { type: 'STRING', enum: ['info', 'alert'] }
                },
                required: ['message']
            }
        })
    },

    // --- 12. UTILITY (Google Sheets) ---
    {
        id: 'gsheets',
        name: 'Google Sheets (Lead Capture)',
        description: 'Append rows to a Google Sheet.',
        category: 'utility',
        icon: Icons.Sheet,
        fields: [{ key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text' }],
        generate: (inputs) => ({
            name: 'append_sheet_row',
            description: `Adds a new row to Sheet ID ${inputs.spreadsheetId}`,
            parameters: {
                type: 'OBJECT',
                properties: {
                    values: { type: 'ARRAY', description: 'List of strings to append as columns' }
                },
                required: ['values']
            }
        })
    },
    
    // --- 13. CUSTOM ---
    {
        id: 'custom_webhook',
        name: 'Custom API / Webhook',
        description: 'Connect to any external REST API.',
        category: 'custom',
        icon: Icons.Webhook,
        fields: [
            { key: 'functionName', label: 'Function Name (snake_case)', type: 'text', placeholder: 'check_inventory' },
            { key: 'description', label: 'Description for AI', type: 'text', placeholder: 'Checks stock for an item SKU' },
            { key: 'method', label: 'HTTP Method', type: 'select', options: ['GET', 'POST'] },
            { key: 'url', label: 'Target URL', type: 'text', placeholder: 'https://api.myshop.com/v1/stock' },
            { key: 'authHeader', label: 'Auth Header (Optional)', type: 'password', placeholder: 'Bearer sk_...' }
        ],
        generate: (inputs) => ({
            name: inputs.functionName,
            description: inputs.description + ` (Endpoint: ${inputs.method} ${inputs.url})`,
            parameters: {
                type: 'OBJECT',
                properties: {
                    query: { type: 'STRING', description: 'Search query or ID' }
                },
                required: ['query']
            }
        })
    }
];

interface ConfigPanelProps {
  bot: Bot;
  onUpdate: (updatedBot: Bot) => void;
  onBack: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ bot, onUpdate, onBack }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'backend' | 'twilio'>('settings');
  const [isSyncingVoices, setIsSyncingVoices] = useState(false);
  
  // Tools State
  const [toolsView, setToolsView] = useState<'visual' | 'code'>('visual');
  const [toolPrompt, setToolPrompt] = useState('');
  const [isGeneratingTool, setIsGeneratingTool] = useState(false);
  
  // Library Modals State
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ToolTemplate | null>(null);
  const [templateInputs, setTemplateInputs] = useState<Record<string, any>>({});
  
  // Concurrency Mock State
  const [currentLines, setCurrentLines] = useState(2);
  const [buyingLine, setBuyingLine] = useState(false);

  const updateConfig = (field: keyof typeof bot.config, value: any) => {
    onUpdate({
        ...bot,
        config: {
            ...bot.config,
            [field]: value
        }
    });
  };

  const handleSyncVoices = () => {
    setIsSyncingVoices(true);
    setTimeout(() => setIsSyncingVoices(false), 1500);
  };

  const getToolsArray = () => {
    try {
        const parsed = JSON.parse(bot.config.tools || "[]");
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
  };

  const addToolToConfig = (toolJson: any | any[]) => {
    const currentTools = getToolsArray();
    let updatedTools;
    
    // Handle Array of tools (Suites) vs Single Tool
    if (Array.isArray(toolJson)) {
        updatedTools = [...currentTools, ...toolJson];
    } else {
        updatedTools = [...currentTools, toolJson];
    }
    
    updateConfig('tools', JSON.stringify(updatedTools, null, 2));
  };

  const handleGenerateTool = async () => {
    if (!toolPrompt.trim()) return;
    setIsGeneratingTool(true);
    try {
        const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a valid JSON object representing a FunctionDeclaration for: "${toolPrompt}". 
            Output keys: 'name', 'description', 'parameters'. Return ONLY JSON.`,
            config: { responseMimeType: 'application/json' }
        });
        const newTool = JSON.parse(response.text || "{}");
        if (newTool.name) {
            addToolToConfig(newTool);
            setToolPrompt('');
        }
    } catch (e: any) {
        alert(`Generation failed: ${e.message}`);
    } finally {
        setIsGeneratingTool(false);
    }
  };

  const handleDeleteTool = (index: number) => {
    const currentTools = getToolsArray();
    const updatedTools = currentTools.filter((_, i) => i !== index);
    updateConfig('tools', JSON.stringify(updatedTools, null, 2));
  };

  const openLibrary = () => {
    setShowLibrary(true);
    setSelectedTemplate(null);
    setTemplateInputs({});
  };

  const handleTemplateSelect = (template: ToolTemplate) => {
    setSelectedTemplate(template);
    setTemplateInputs({});
  };

  const handleTemplateSave = () => {
    if (selectedTemplate) {
        try {
            const toolJson = selectedTemplate.generate(templateInputs);
            addToolToConfig(toolJson);
            setShowLibrary(false);
            setSelectedTemplate(null);
        } catch (e) {
            console.error(e);
            alert("Error generating tool config");
        }
    }
  };
  
  const handleBuyExtraLine = () => {
      setBuyingLine(true);
      setTimeout(() => {
          if (confirm("Redirect to Stripe Checkout for 'Extra Concurrent Line' (€50/mo)?")) {
               alert("Payment Successful! Lines increased.");
               setCurrentLines(prev => prev + 1);
          }
          setBuyingLine(false);
      }, 800);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 relative">
      {/* Editor Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div>
                <input 
                    type="text" 
                    value={bot.name}
                    onChange={(e) => onUpdate({...bot, name: e.target.value})}
                    className="bg-transparent text-xl font-bold text-white focus:outline-none focus:border-b border-indigo-500"
                />
                <div className="text-xs text-slate-400 mt-1 flex gap-2 items-center">
                    <span>{bot.id}</span>
                    <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
                    <span className={`uppercase ${bot.status === 'active' ? 'text-green-400' : 'text-amber-400'}`}>{bot.status}</span>
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium">
                Save Draft
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors text-sm font-medium shadow-lg shadow-indigo-500/20">
                Deploy Changes
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
          {/* Settings Sidebar */}
          <div className="w-64 bg-slate-800/50 border-r border-slate-700 p-4 space-y-2 shrink-0">
            {['settings', 'backend', 'twilio'].map(tab => (
                 <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    {tab === 'backend' ? 'Backend & Tools' : tab === 'twilio' ? 'Integration Code' : 'General Settings'}
                </button>
            ))}
          </div>

          {/* Form Area */}
          <div className="flex-1 p-8 overflow-y-auto">
             <div className="max-w-4xl mx-auto pb-20">
                
                {activeTab === 'settings' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Voice Settings */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-white">Voice Persona</h3>
                                <button onClick={handleSyncVoices} className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300">
                                    <svg className={`w-3.5 h-3.5 ${isSyncingVoices ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Sync Voices
                                </button>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.values(VoiceName).map((voice) => (
                                <button
                                    key={voice}
                                    onClick={() => updateConfig('voiceName', voice)}
                                    className={`p-4 rounded-xl border text-sm font-medium transition-all text-left flex items-center gap-3 ${
                                    bot.config.voiceName === voice
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800/80'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                        bot.config.voiceName === voice ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'
                                    }`}>
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                        </svg>
                                    </div>
                                    <span>{voice}</span>
                                </button>
                                ))}
                            </div>
                        </section>
                        
                        {/* Concurrency / Scaling Widget */}
                        <section className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                        Concurrency & Scaling
                                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/20">Live</span>
                                    </h3>
                                    <p className="text-slate-400 text-sm">Manage parallel call capacity for this customer account.</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">{currentLines}</div>
                                    <div className="text-xs text-slate-500 uppercase">Max Active Lines</div>
                                </div>
                            </div>
                            
                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden mb-6">
                                <div className="h-full bg-indigo-500 w-[40%] rounded-full"></div>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                                <div className="text-sm text-slate-400">
                                    Need more capacity? Scale up instantly.
                                </div>
                                <button 
                                    onClick={handleBuyExtraLine}
                                    disabled={buyingLine}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                                >
                                    {buyingLine ? 'Processing...' : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            Buy Extra Line (+€50/mo)
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>
                        
                        {/* System Instructions */}
                        <section>
                            <h3 className="text-lg font-medium text-white mb-4">System Instructions</h3>
                            <textarea
                                value={bot.config.systemInstruction}
                                onChange={(e) => updateConfig('systemInstruction', e.target.value)}
                                rows={6}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </section>

                         <section>
                            <h3 className="text-lg font-medium text-white mb-4">Greeting</h3>
                            <input
                                value={bot.config.greeting}
                                onChange={(e) => updateConfig('greeting', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </section>
                    </div>
                )}

                {activeTab === 'backend' && (
                    <div className="h-full flex flex-col space-y-6 animate-fade-in">
                        <div className="flex justify-between items-center bg-slate-800 p-2 rounded-lg border border-slate-700">
                             <div className="flex gap-2">
                                <button onClick={() => setToolsView('visual')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${toolsView === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Visual Builder</button>
                                <button onClick={() => setToolsView('code')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${toolsView === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>Raw JSON</button>
                             </div>
                        </div>

                        {/* AI / Magic Wand */}
                        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-xl p-6">
                            <div className="flex gap-4 items-start">
                                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 mt-1">{Icons.Webhook}</div>
                                <div className="flex-1">
                                    <h3 className="text-white font-bold mb-1">AI Tool Generator</h3>
                                    <p className="text-slate-400 text-sm mb-4">Describe functionality (e.g., "Check order status via API").</p>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={toolPrompt}
                                            onChange={(e) => setToolPrompt(e.target.value)}
                                            placeholder="Describe your tool..."
                                            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500 outline-none"
                                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateTool()}
                                        />
                                        <button 
                                            onClick={handleGenerateTool}
                                            disabled={isGeneratingTool || !toolPrompt.trim()}
                                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg flex items-center gap-2"
                                        >
                                            {isGeneratingTool ? '...' : 'Generate'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                         {/* Tools List */}
                         {toolsView === 'visual' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Tools</h4>
                                    <button 
                                        onClick={openLibrary}
                                        className="text-sm bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-white px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
                                    >
                                        <span className="text-emerald-400">+</span> Add from Library
                                    </button>
                                </div>
                                {getToolsArray().map((tool: any, idx: number) => (
                                    <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex justify-between items-start group hover:border-slate-500 transition-all">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 bg-sky-500/20 text-sky-400 rounded-lg flex items-center justify-center font-bold font-mono">{'{ }'}</div>
                                            <div>
                                                <h5 className="font-bold text-white text-base">{tool.name}</h5>
                                                <p className="text-sm text-slate-400 mt-1 max-w-xl">{tool.description}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteTool(idx)} className="text-slate-500 hover:text-red-400">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {toolsView === 'code' && (
                            <textarea
                                value={bot.config.tools}
                                onChange={(e) => updateConfig('tools', e.target.value)}
                                className="w-full h-[500px] bg-slate-950 p-4 font-mono text-sm text-green-400 border border-slate-700 rounded-xl outline-none"
                                spellCheck={false}
                            />
                        )}
                    </div>
                )}
             </div>
          </div>
      </div>

      {/* --- TOOL LIBRARY MODAL --- */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white">{selectedTemplate ? 'Configure Tool' : 'Enterprise Tool Library'}</h3>
                        <p className="text-xs text-slate-400">
                            {selectedTemplate ? `Setup ${selectedTemplate.name}` : 'Select a pre-built integration.'}
                        </p>
                    </div>
                    <button onClick={() => setShowLibrary(false)} className="text-slate-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!selectedTemplate ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {TOOL_TEMPLATES.map(template => (
                                <div 
                                    key={template.id} 
                                    onClick={() => handleTemplateSelect(template)}
                                    className="bg-slate-900 border border-slate-700 p-5 rounded-xl hover:border-indigo-500 hover:bg-slate-800 transition-all cursor-pointer group"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                        {template.icon}
                                    </div>
                                    <h4 className="font-bold text-white mb-1">{template.name}</h4>
                                    <p className="text-sm text-slate-400 mb-3">{template.description}</p>
                                    <div className="flex gap-2">
                                        <span className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 uppercase tracking-wide text-slate-500 group-hover:text-indigo-300 group-hover:border-indigo-500/30">
                                            {template.category}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-xl mx-auto space-y-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                                    {selectedTemplate.icon}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white">{selectedTemplate.name}</h4>
                                    <p className="text-slate-400 text-sm">{selectedTemplate.description}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {selectedTemplate.fields.map(field => (
                                    <div key={field.key}>
                                        <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">{field.label}</label>
                                        {field.type === 'select' ? (
                                            <select
                                                value={templateInputs[field.key] || ''}
                                                onChange={e => setTemplateInputs({...templateInputs, [field.key]: e.target.value})}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                                            >
                                                <option value="" disabled>Select {field.label}</option>
                                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                value={templateInputs[field.key] || ''}
                                                onChange={e => setTemplateInputs({...templateInputs, [field.key]: e.target.value})}
                                                placeholder={field.placeholder}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                                            />
                                        )}
                                        {field.helperText && <p className="text-xs text-slate-500 mt-1">{field.helperText}</p>}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg text-amber-200 text-xs">
                                <strong>Note:</strong> Sensitive credentials (like API Keys) entered here are saved into the bot configuration so the Tool Definition works. Ensure your backend handles the actual secure transmission.
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {selectedTemplate && (
                    <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex justify-between">
                        <button 
                            onClick={() => setSelectedTemplate(null)}
                            className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                        >
                            Back to Library
                        </button>
                        <button 
                            onClick={handleTemplateSave}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20"
                        >
                            Add Tool
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;

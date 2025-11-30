
import React, { useState, useEffect } from 'react';
import { Bot, BotConfig, ViewState, VoiceName, Customer, PricingPlan, CallLog, AppNotification, User } from './types';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import CustomerList from './components/CustomerList';
import CustomerDetail from './components/CustomerDetail';
import ConfigPanel from './components/ConfigPanel';
import Playground from './components/Playground';
import PricingManager from './components/PricingManager';
import NotificationDropdown from './components/NotificationDropdown';
import TwilioManager from './components/TwilioManager';
import ServerManager from './components/ServerManager';
import EmailManager from './components/EmailManager';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { searchAvailableNumbers, provisionNumber, updatePhoneNumberWebhook } from './services/twilioService';
import config from './config';

// --- MOCK DATA ---
const DEFAULT_TOOLS = `[
  {
    "name": "check_order_status",
    "description": "Checks the status of a customer order by ID.",
    "parameters": {
      "type": "OBJECT",
      "properties": {
        "order_id": {
          "type": "STRING",
          "description": "The unique order identifier"
        }
      },
      "required": ["order_id"]
    }
  }
]`;

const INITIAL_PLANS: PricingPlan[] = [
    {
        id: 'plan_payg',
        name: 'Pay-as-you-go',
        price: 0,
        currency: 'EUR',
        interval: 'month', 
        includedMinutes: 0,
        signupBonusMinutes: 100, // One-time bonus
        overageRatePerMinute: 0.25,
        maxConcurrentLines: 1,
        includesPhoneNumber: false,
        phoneNumberMonthlyPrice: 15,
        extraLineMonthlyPrice: 50,
        features: [
            '100 Min GRATIS (Signup Bonus)',
            'Zahle nur was du verbrauchst',
            'Rufnummer mieten (€15/mo)',
            'DSGVO-konform',
            'Standard-Tool-Calls & Webhooks'
        ],
        stripeProductId: 'prod_paygo123'
    },
    {
        id: 'plan_starter',
        name: 'Starter',
        price: 59,
        currency: 'EUR',
        interval: 'month',
        includedMinutes: 150,
        signupBonusMinutes: 0,
        overageRatePerMinute: 0.20,
        maxConcurrentLines: 1,
        includesPhoneNumber: true,
        phoneNumberMonthlyPrice: 0,
        extraLineMonthlyPrice: 45,
        features: [
            '150 min inkludiert / Monat',
            '1 Telefonleitung',
            '1 VoxOn-Nummer (AT/EU) inkl.',
            'Basis-Berichte',
            'E-Mail Support (24h)'
        ],
        stripeProductId: 'prod_starter123'
    },
    {
        id: 'plan_medium',
        name: 'Medium',
        price: 199,
        currency: 'EUR',
        interval: 'month',
        includedMinutes: 900,
        signupBonusMinutes: 0,
        overageRatePerMinute: 0.15,
        maxConcurrentLines: 2,
        includesPhoneNumber: true,
        phoneNumberMonthlyPrice: 0,
        extraLineMonthlyPrice: 40,
        isPopular: true,
        features: [
            '900 min inkludiert / Monat',
            '2 Telefonleitungen parallel',
            'Alles aus Starter +',
            'Tool-Calls & CRM Integration',
            'Telefon & E-Mail Support'
        ],
        stripeProductId: 'prod_medium123'
    },
    {
        id: 'plan_pro',
        name: 'Pro',
        price: 499,
        currency: 'EUR',
        interval: 'month',
        includedMinutes: 2400,
        signupBonusMinutes: 0,
        overageRatePerMinute: 0.10,
        maxConcurrentLines: 4,
        includesPhoneNumber: true,
        phoneNumberMonthlyPrice: 0,
        extraLineMonthlyPrice: 35,
        features: [
            '2400 min inkludiert / Monat',
            '4 Telefonleitungen + Warteschleife',
            '2 Nummern inkl.',
            'Prioritäts-Support (< 2h)',
            'Premium-Integrationen (Slack/Alerts)',
            'Monatlicher Performance-Report'
        ],
        stripeProductId: 'prod_pro123'
    }
];

// Mock Call Logs for the customers
const MOCK_CALL_LOGS_CUST1: CallLog[] = [
    { id: 'call_001', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), durationSeconds: 145, cost: 0.50, status: 'completed', direction: 'inbound', phoneNumber: '+491701234567' },
    { id: 'call_002', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), durationSeconds: 300, cost: 1.20, status: 'completed', direction: 'inbound', phoneNumber: '+491709876543' },
    { id: 'call_003', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), durationSeconds: 0, cost: 0, status: 'missed', direction: 'inbound', phoneNumber: '+491701112223' },
];

const INITIAL_CUSTOMERS: Customer[] = [
    {
        id: 'cust_001',
        companyName: 'TechSolutions GmbH',
        contactName: 'Markus Weber',
        email: 'm.weber@techsolutions.de',
        phone: '+49 30 12345678',
        address: 'Alexanderplatz 1, 10178 Berlin',
        vatId: 'DE123456789',
        status: 'active',
        planId: 'plan_medium',
        signupBonusRemaining: 0, // already used or not applicable
        paymentMethod: { type: 'invoice', details: 'IBAN: DE89 1001 ...', status: 'valid' },
        billingStats: {
            currentPeriodStart: '2023-10-01',
            currentPeriodEnd: '2023-10-31',
            usedMinutes: 945, // Over limit
            baseFee: 199,
            overageFee: 0
        },
        callHistory: MOCK_CALL_LOGS_CUST1
    },
    {
        id: 'cust_002',
        companyName: 'Bäckerei Müller',
        contactName: 'Lisa Müller',
        email: 'info@baeckerei-mueller.de',
        phone: '+49 89 98765432',
        address: 'Marienplatz 5, 80331 München',
        vatId: 'DE987654321',
        status: 'active',
        planId: 'plan_payg',
        signupBonusRemaining: 80, // Has 80 mins left of 100
        paymentMethod: { type: 'credit_card', details: 'Visa **** 4242', status: 'valid' },
        billingStats: {
            currentPeriodStart: '2023-10-15',
            currentPeriodEnd: '2023-11-14',
            usedMinutes: 20, // Used 20 mins of bonus
            baseFee: 0,
            overageFee: 0
        },
        callHistory: []
    }
];

const INITIAL_BOTS: Bot[] = [
    {
        id: 'bot_alpha_1',
        customerId: 'cust_001',
        name: 'Tech Support',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        phoneNumber: '+49 30 12345678', // Already has number
        stats: { calls: 142, minutes: 380 },
        config: {
            voiceName: VoiceName.Puck,
            systemInstruction: "You are a professional customer support agent for TechSolutions GmbH.",
            greeting: "Willkommen bei TechSolutions. Wie kann ich Ihnen helfen?",
            tools: DEFAULT_TOOLS
        }
    },
    {
        id: 'bot_beta_2',
        customerId: 'cust_002',
        name: 'Bestellannahme',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        // No number yet
        stats: { calls: 28, minutes: 45 },
        config: {
            voiceName: VoiceName.Fenrir,
            systemInstruction: "Du bist ein freundlicher Mitarbeiter der Bäckerei Müller. Du nimmst Bestellungen für Brötchen und Kuchen entgegen.",
            greeting: "Bäckerei Müller, was darf es heute sein?",
            tools: "[]"
        }
    }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
    {
        id: 'n1',
        title: 'System Initialized',
        message: 'VoiceOmni Platform loaded in ' + config.env + ' mode.',
        type: 'info',
        timestamp: new Date(),
        read: false
    }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // Data State
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [bots, setBots] = useState<Bot[]>(INITIAL_BOTS);
  const [plans, setPlans] = useState<PricingPlan[]>(INITIAL_PLANS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Navigation State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [editingBotId, setEditingBotId] = useState<string | null>(null);

  // Initialize checks
  useEffect(() => {
    if (!config.useMockData) {
        console.log("App configured to use REAL BACKEND at: " + config.apiBaseUrl);
    }
  }, []);

  // --- ACTIONS ---

  const handleLogin = () => {
      // Mock Login
      setCurrentUser({
          id: 'user_admin',
          name: 'John Doe',
          email: 'admin@voiceomni.app',
          role: 'admin'
      });
  };

  const handleRegister = () => {
      // Mock Register
      setCurrentUser({
          id: 'user_new',
          name: 'New User',
          email: 'user@company.com',
          role: 'customer',
          customerId: 'cust_new'
      });
      // Also create customer record...
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setAuthView('login');
  };

  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    const newNotif: AppNotification = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        type,
        timestamp: new Date(),
        read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({...n, read: true})));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleCreateCustomer = () => {
    const defaultPlan = plans.find(p => p.id === 'plan_payg');
    
    const newCustomer: Customer = {
        id: `cust_${Date.now()}`,
        companyName: 'Neuer Kunde GmbH',
        contactName: 'Max Mustermann',
        email: 'kontakt@neuerkunde.de',
        phone: '+43 1 234 567',
        address: 'Musterstraße 1, 1010 Wien',
        vatId: 'ATU12345678',
        status: 'active',
        planId: 'plan_payg',
        signupBonusRemaining: defaultPlan?.signupBonusMinutes || 0,
        paymentMethod: { type: 'invoice', details: 'Rechnung', status: 'valid' },
        billingStats: {
            currentPeriodStart: new Date().toISOString().split('T')[0],
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            usedMinutes: 0,
            baseFee: defaultPlan?.price || 0,
            overageFee: 0
        },
        callHistory: []
    };
    setCustomers([newCustomer, ...customers]);
    addNotification('New Customer Added', `${newCustomer.companyName} has been added.`, 'info');
  };

  const handleCreateBot = (customerId: string) => {
    const newBot: Bot = {
        id: `bot_${Date.now()}`,
        customerId: customerId,
        name: 'Neuer Voicebot',
        status: 'draft',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        stats: { calls: 0, minutes: 0 },
        config: {
            voiceName: VoiceName.Kore,
            systemInstruction: "Du bist ein hilfreicher Assistent.",
            greeting: "Hallo, wie kann ich helfen?",
            tools: "[]"
        }
    };
    setBots([...bots, newBot]);
    setEditingBotId(newBot.id);
    addNotification('Bot Created', 'A new voicebot draft has been initialized.', 'info');
  };

  const handleUpdateBot = (updatedBot: Bot) => {
    setBots(bots.map(b => b.id === updatedBot.id ? updatedBot : b));
    if (updatedBot.status === 'active' && bots.find(b => b.id === updatedBot.id)?.status === 'draft') {
        addNotification('Bot Deployed Successfully', `${updatedBot.name} is now active.`, 'success');
    }
  };

  const handleDeleteBot = (id: string) => {
    if (confirm('Möchten Sie diesen Bot wirklich löschen?')) {
        setBots(bots.filter(b => b.id !== id));
        if (editingBotId === id) setEditingBotId(null);
        addNotification('Bot Deleted', 'The voicebot has been permanently removed.', 'warning');
    }
  };

  const handleAssignNumber = async (bot: Bot, customer: Customer, plan: PricingPlan) => {
    const numbers = await searchAvailableNumbers('DE');
    if (numbers.length === 0) {
        addNotification("Provisioning Failed", "No numbers available.", "error");
        return;
    }
    const selectedNumber = numbers[0].phoneNumber;

    if (!plan.includesPhoneNumber) {
        const confirmed = confirm(`Rent ${selectedNumber} for €${plan.phoneNumberMonthlyPrice}/month?`);
        if (!confirmed) return;
        addNotification("Payment Processing", "Processing rental fee...", "info");
        await new Promise(r => setTimeout(r, 1000));
    }

    const result = await provisionNumber(selectedNumber, bot.id, `https://api.voiceomni.app/webhook/${bot.id}`);
    
    const updatedBot = { ...bot, phoneNumber: selectedNumber };
    setBots(prev => prev.map(b => b.id === bot.id ? updatedBot : b));
    addNotification("Number Provisioned", `${selectedNumber} is now active.`, "success");
  };

  const handleConfigureWebhook = async (bot: Bot, phoneNumber: string) => {
    addNotification("Configuring Webhook", `Setting up webhook for ${phoneNumber}...`, "info");
    await updatePhoneNumberWebhook(phoneNumber, bot.id, `https://api.voiceomni.app/webhook/${bot.id}`);
    
    const updatedBot = { ...bot, phoneNumber: phoneNumber };
    setBots(prev => prev.map(b => b.id === bot.id ? updatedBot : b));
    addNotification("Webhook Configured", `VoiceOmni is now connected to ${phoneNumber}.`, "success");
  };

  const handleSavePlan = (plan: PricingPlan) => {
    const exists = plans.find(p => p.id === plan.id);
    if (exists) {
        setPlans(plans.map(p => p.id === plan.id ? plan : p));
        addNotification('Pricing Plan Updated', `${plan.name} configuration saved.`, 'success');
    } else {
        setPlans([...plans, plan]);
        addNotification('New Plan Created', `${plan.name} is now available.`, 'success');
    }
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Delete this package?')) {
        setPlans(plans.filter(p => p.id !== id));
        addNotification('Plan Deleted', 'Pricing package removed.', 'warning');
    }
  };

  // --- RENDER LOGIC ---
  if (!currentUser) {
      if (authView === 'login') return <LoginPage onLogin={handleLogin} onGoToRegister={() => setAuthView('register')} />;
      if (authView === 'register') return <RegisterPage onRegister={handleRegister} onGoToLogin={() => setAuthView('login')} />;
  }

  const renderContent = () => {
    if (editingBotId) {
        const bot = bots.find(b => b.id === editingBotId);
        if (bot) {
            return (
                <ConfigPanel 
                    bot={bot} 
                    onUpdate={handleUpdateBot} 
                    onBack={() => setEditingBotId(null)} 
                />
            );
        }
    }

    switch (currentView) {
        case 'dashboard':
            return <DashboardHome bots={bots} customers={customers} plans={plans} />;
        case 'customers':
            if (selectedCustomerId) {
                const customer = customers.find(c => c.id === selectedCustomerId);
                const customerBots = bots.filter(b => b.customerId === selectedCustomerId);
                if (customer) {
                    return (
                        <CustomerDetail 
                            customer={customer}
                            bots={customerBots}
                            onBack={() => setSelectedCustomerId(null)}
                            onBotSelect={(bot) => setEditingBotId(bot.id)}
                            onBotCreate={() => handleCreateBot(customer.id)}
                            onBotDelete={handleDeleteBot}
                            onAssignNumber={handleAssignNumber}
                            onConfigureWebhook={handleConfigureWebhook}
                            plans={plans}
                        />
                    );
                }
            }
            return <CustomerList customers={customers} onSelect={(c) => setSelectedCustomerId(c.id)} onCreate={handleCreateCustomer} />;
        case 'pricing':
            return <PricingManager plans={plans} onSavePlan={handleSavePlan} onDeletePlan={handleDeletePlan} />;
        case 'twilio':
            return <TwilioManager bots={bots} customers={customers} plans={plans} />;
        case 'server':
            return <ServerManager />;
        case 'mails':
            return <EmailManager />;
        case 'playground':
            return <Playground bots={bots} />;
        case 'settings':
            return <div className="p-8 text-slate-500">Global Settings (API Keys, Billing)</div>;
        default:
            return <div>Not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden">
        <Sidebar currentView={currentView} setCurrentView={(view) => {
            setCurrentView(view);
            if (view !== 'customers') {
                setSelectedCustomerId(null);
                setEditingBotId(null);
            }
        }} />

        <main className="flex-1 flex flex-col min-w-0 bg-slate-900/50">
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900 shrink-0 z-20 relative">
                <div className="text-sm text-slate-400 breadcrumbs flex items-center gap-2">
                    <span>VoiceOmni</span> 
                    <span>/</span> 
                    <span className="capitalize text-white">{currentView}</span>
                </div>
                
                <div className="flex items-center gap-4">
                     <NotificationDropdown notifications={notifications} onMarkAllRead={handleMarkAllRead} onClear={handleClearNotifications} />
                     <div className="h-6 w-px bg-slate-700 mx-1"></div>
                     <button onClick={handleLogout} className="text-slate-400 hover:text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{currentUser.name.substring(0,2).toUpperCase()}</span>
                        </div>
                     </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto relative z-10">
                {renderContent()}
            </div>
        </main>
    </div>
  );
};

export default App;

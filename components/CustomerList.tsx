import React from 'react';
import { Customer } from '../types';

interface CustomerListProps {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  onCreate: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onSelect, onCreate }) => {
  return (
    <div className="p-8 h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-white mb-1">Kunden</h1>
            <p className="text-slate-400">Verwalten Sie Ihre Kunden, Firmendaten und Zahlungsinformationen.</p>
        </div>
        <button 
            onClick={onCreate}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neuer Kunde
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden flex-1 flex flex-col shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/50">
                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Firma</th>
                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Kontakt</th>
                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Zahlungsmethode</th>
                        <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Aktion</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {customers.map(customer => (
                        <tr 
                            key={customer.id} 
                            onClick={() => onSelect(customer)}
                            className="hover:bg-slate-700/50 transition-colors cursor-pointer group"
                        >
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                                        {customer.companyName.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-200">{customer.companyName}</div>
                                        <div className="text-xs text-slate-500">{customer.vatId}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="text-sm text-slate-300">{customer.contactName}</div>
                                <div className="text-xs text-slate-500">{customer.email}</div>
                            </td>
                            <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    customer.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                }`}>
                                    {customer.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                                </span>
                            </td>
                            <td className="p-4 text-slate-300 text-sm">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    {customer.paymentMethod.type === 'credit_card' ? 'Kreditkarte' : 'Rechnung'}
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 inline-block transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;

import config from '../config';
import { Bot, Customer, PricingPlan } from '../types';

/**
 * API SERVICE
 * 
 * This layer abstracts the data fetching.
 * If config.useMockData is true, it returns the local seed data.
 * If false, it makes real HTTP requests to your Cloud Run Backend.
 */

// --- MOCK DATA IMPORTS (Keep these for fallback/demo) ---
// (In a real scenario, you might move the large mock arrays from App.tsx to a separate mocks.ts file)

class ApiService {
  
  // --- CUSTOMERS ---
  
  async getCustomers(): Promise<Customer[]> {
    if (config.useMockData) {
      // Return Seed Data (Simulated delay)
      await new Promise(r => setTimeout(r, 500));
      return JSON.parse(localStorage.getItem('mock_customers') || '[]');
    }

    // REAL BACKEND CALL
    /*
    const response = await fetch(`${config.apiBaseUrl}/customers`, {
        headers: { 'Authorization': `Bearer ${this.getToken()}` }
    });
    return response.json();
    */
    return [];
  }

  async createCustomer(customer: Customer): Promise<Customer> {
    if (config.useMockData) {
        return customer; // Logic handled in App.tsx state for mocks
    }
    
    // REAL BACKEND CALL
    /*
    const response = await fetch(`${config.apiBaseUrl}/customers`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getToken()}`
        },
        body: JSON.stringify(customer)
    });
    return response.json();
    */
    throw new Error("Backend not connected");
  }

  // --- BOTS ---

  async getBots(customerId?: string): Promise<Bot[]> {
    if (config.useMockData) {
        await new Promise(r => setTimeout(r, 400));
        return JSON.parse(localStorage.getItem('mock_bots') || '[]');
    }

    // REAL BACKEND CALL
    // const query = customerId ? `?customerId=${customerId}` : '';
    // const res = await fetch(`${config.apiBaseUrl}/bots${query}`);
    // return res.json();
    return [];
  }

  async deployBot(bot: Bot): Promise<Bot> {
      // This would trigger the Cloud Run / Docker container creation on the backend
      if (config.useMockData) return bot;

      // await fetch(`${config.apiBaseUrl}/bots/${bot.id}/deploy`, { method: 'POST' ... })
      return bot;
  }

  // --- INFRASTRUCTURE (Twilio/Stripe) ---

  async purchasePhoneNumber(countryCode: string, botId: string): Promise<string> {
      if (config.useMockData) return "+49 123 456 789";

      // REAL CALL
      // const res = await fetch(`${config.apiBaseUrl}/twilio/numbers/buy`, {
      //   body: JSON.stringify({ countryCode, botId })
      // });
      // const data = await res.json();
      // return data.phoneNumber;
      throw new Error("Not implemented");
  }

  // --- AUTH HELPER ---
  private getToken(): string {
      return localStorage.getItem('auth_token') || '';
  }
}

export const api = new ApiService();


import config from '../config';
import { Bot, Customer, PricingPlan, SystemMetrics } from '../types';

/**
 * API SERVICE
 * 
 * This layer abstracts the data fetching.
 * If config.useMockData is true, it returns the local seed data.
 * If false, it makes real HTTP requests to your Cloud Run Backend.
 */

class ApiService {
  
  // --- AUTH ---

  async registerUser(data: { company: string; email: string; addonLines: boolean; addonNumber: boolean }) {
      if (config.useMockData) {
          await new Promise(r => setTimeout(r, 1000));
          return { success: true };
      }
      const response = await fetch(`${config.apiBaseUrl}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });
      return response.json();
  }

  // --- CUSTOMERS ---
  
  async getCustomers(): Promise<Customer[]> {
    if (config.useMockData) {
      await new Promise(r => setTimeout(r, 500));
      return JSON.parse(localStorage.getItem('mock_customers') || '[]');
    }
    // REAL BACKEND CALL
    const response = await fetch(`${config.apiBaseUrl}/customers`);
    return response.json();
  }

  async createCustomer(customer: Customer): Promise<Customer> {
    if (config.useMockData) {
        return customer; 
    }
    const response = await fetch(`${config.apiBaseUrl}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
    });
    return response.json();
  }

  async updateCustomerStatus(id: string, status: 'active' | 'suspended' | 'inactive'): Promise<boolean> {
      if (config.useMockData) return true;
      const response = await fetch(`${config.apiBaseUrl}/customers/${id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
      });
      return response.ok;
  }

  // --- BOTS ---

  async getBots(customerId?: string): Promise<Bot[]> {
    if (config.useMockData) {
        await new Promise(r => setTimeout(r, 400));
        return JSON.parse(localStorage.getItem('mock_bots') || '[]');
    }
    const query = customerId ? `?customerId=${customerId}` : '';
    const res = await fetch(`${config.apiBaseUrl}/bots${query}`);
    return res.json();
  }

  // --- INFRASTRUCTURE (Twilio/Stripe) ---

  async purchasePhoneNumber(countryCode: string, botId: string): Promise<string> {
      if (config.useMockData) return "+49 123 456 789";

      const res = await fetch(`${config.apiBaseUrl}/twilio/numbers/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, botId })
      });
      const data = await res.json();
      return data.phoneNumber;
  }

  // --- SYSTEM METRICS (SERVER MANAGER) ---

  async getServerMetrics(): Promise<SystemMetrics> {
      if (config.useMockData) {
          // Simulate fluctuation
          return {
              cpu: 45 + (Math.random() * 10 - 5),
              memory: 60 + (Math.random() * 5 - 2.5),
              redis: 30 + (Math.random() * 5),
              activeLines: Math.floor(Math.random() * 20) + 5,
              uptime: 36000
          };
      }
      
      try {
          const res = await fetch(`${config.apiBaseUrl}/system/metrics`);
          return res.json();
      } catch (e) {
          console.error("Failed to fetch metrics", e);
          return { cpu: 0, memory: 0, redis: 0, activeLines: 0, uptime: 0 };
      }
  }

  // --- LINE MANAGEMENT ---
  
  async checkLineAvailability(customerId: string): Promise<boolean> {
      if (config.useMockData) return true;
      
      const res = await fetch(`${config.apiBaseUrl}/lines/check/${customerId}`);
      const data = await res.json();
      return data.available;
  }
}

export const api = new ApiService();

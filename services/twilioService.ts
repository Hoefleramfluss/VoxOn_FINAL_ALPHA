/**
 * Simulated Twilio Service
 * Handles Number Searching, Purchasing, and Webhook Configuration.
 */

export interface AvailableNumber {
    phoneNumber: string;
    locality: string;
    region: string;
    isoCountry: string;
    monthlyPrice: number;
}

export const searchAvailableNumbers = async (countryCode: string): Promise<AvailableNumber[]> => {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock data based on country
    if (countryCode === 'DE') {
        return [
            { phoneNumber: '+49 30 12345601', locality: 'Berlin', region: 'Berlin', isoCountry: 'DE', monthlyPrice: 15 },
            { phoneNumber: '+49 89 98765402', locality: 'München', region: 'Bayern', isoCountry: 'DE', monthlyPrice: 15 },
            { phoneNumber: '+49 40 55511103', locality: 'Hamburg', region: 'Hamburg', isoCountry: 'DE', monthlyPrice: 15 },
        ];
    } else if (countryCode === 'AT') {
        return [
            { phoneNumber: '+43 1 55566601', locality: 'Wien', region: 'Wien', isoCountry: 'AT', monthlyPrice: 12 },
            { phoneNumber: '+43 662 44433302', locality: 'Salzburg', region: 'Salzburg', isoCountry: 'AT', monthlyPrice: 12 },
        ];
    }
    
    // Default fallback
    return [
        { phoneNumber: '+1 415 555 0100', locality: 'San Francisco', region: 'CA', isoCountry: 'US', monthlyPrice: 5 },
        { phoneNumber: '+44 20 7123 4567', locality: 'London', region: '', isoCountry: 'GB', monthlyPrice: 8 },
    ];
};

export const provisionNumber = async (phoneNumber: string, botId: string, webhookUrl: string): Promise<{ success: boolean; message: string }> => {
    // Simulate Provisioning Process
    // 1. Buy Number
    // 2. Configure Voice URL (Webhook)
    
    console.log(`[Twilio Service] Provisioning ${phoneNumber} for Bot ${botId}...`);
    console.log(`[Twilio Service] Setting Webhook to ${webhookUrl}`);

    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
        success: true,
        message: `Successfully acquired ${phoneNumber} and configured webhook.`
    };
};

export const updatePhoneNumberWebhook = async (phoneNumber: string, botId: string, webhookUrl: string): Promise<boolean> => {
    // Simulate updating an existing number's webhook configuration
    console.log(`[Twilio Service] Updating Webhook for manually entered number ${phoneNumber}...`);
    console.log(`[Twilio Service] Bot ID: ${botId}`);
    console.log(`[Twilio Service] Webhook set to: ${webhookUrl}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
};
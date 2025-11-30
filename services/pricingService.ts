/**
 * Simulates fetching live pricing from Google Cloud Billing Catalog
 * for the specific Gemini 2.5 Flash Native Audio models.
 */

export interface PricingData {
    currency: string;
    inputRatePerMin: number;
    outputRatePerMin: number;
    blendedRatePerMin: number;
    modelName: string;
    lastUpdated: string;
}

export const fetchLivePricing = async (): Promise<PricingData> => {
    // Simulate API Network Latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Based on Gemini 1.5 Flash / 2.5 Preview Multimodal Pricing
    // Approximations:
    // Input Audio: ~$0.002 / minute (converted from token price)
    // Output Audio: ~$0.024 / minute (converted from token price)
    // Real-time volatility simulation (small fluctuations)
    const baseInput = 0.002;
    const baseOutput = 0.024;
    
    // Add tiny micro-fluctuation to simulate "Live Exchange/Spot" rate
    const fluctuation = (Math.random() * 0.0005) - 0.00025;
    
    const inputRate = baseInput + (fluctuation * 0.1);
    const outputRate = baseOutput + fluctuation;

    return {
        currency: 'USD',
        modelName: 'Gemini 2.5 Flash (Native Audio)',
        inputRatePerMin: inputRate,
        outputRatePerMin: outputRate,
        // Assuming a conversation is roughly 50% user speaking, 50% bot speaking
        blendedRatePerMin: (inputRate * 0.5) + (outputRate * 0.5),
        lastUpdated: new Date().toLocaleTimeString()
    };
};
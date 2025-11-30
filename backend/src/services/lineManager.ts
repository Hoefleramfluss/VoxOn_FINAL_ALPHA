
import Redis from 'ioredis';

// Connect to Redis
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Checks if a customer has available lines in their plan.
 * If yes, increments the active line counter.
 */
export async function checkLineAvailability(customerId: string): Promise<boolean> {
    const key = `lines:${customerId}`;
    
    // In a real app, you fetch this limit from Postgres based on the Customer's Plan
    const LIMIT = 5; 

    const currentUsage = await redis.incr(key);
    
    if (currentUsage > LIMIT) {
        await redis.decr(key); // Revert increment
        return false;
    }
    
    return true;
}

/**
 * Decrements the active line counter when a call ends.
 */
export async function releaseLine(customerId: string): Promise<void> {
    const key = `lines:${customerId}`;
    await redis.decr(key);
}

export async function getActiveLines(customerId: string): Promise<number> {
    const key = `lines:${customerId}`;
    const val = await redis.get(key);
    return val ? parseInt(val) : 0;
}

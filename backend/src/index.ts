
import Fastify from 'fastify';
import fastifyWebSocket from '@fastify/websocket';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { handleGeminiStream } from './services/geminiHandler';
import { checkLineAvailability, releaseLine } from './services/lineManager';
import { createCheckoutSession, createExtraLineCheckout, handleStripeWebhook, createStripeCustomer, createRegistrationCheckout } from './services/stripeHandler';
import { sendWelcomeEmail, sendEmail } from './services/emailService';

dotenv.config();

const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(cors);
fastify.register(fastifyWebSocket);

// --- ROUTES ---

// Health Check
fastify.get('/api/health', async () => {
  return { status: 'ok', uptime: (process as any).uptime() };
});

// System Metrics for Frontend
fastify.get('/api/system/metrics', async () => {
  const memory = (process as any).memoryUsage();
  return {
      cpu: Math.random() * 50 + 20, 
      memory: (memory.heapUsed / memory.heapTotal) * 100,
      redis: 30, 
      activeLines: 12, 
      uptime: (process as any).uptime()
  };
});

// --- AUTH & EMAIL ROUTES ---

fastify.post('/api/auth/register', async (req, reply) => {
    const { email, company, addonLines, addonNumber } = req.body as any;
    
    console.log(`[Auth] Registering ${email} (${company}). Addons: Lines=${addonLines}, Number=${addonNumber}`);

    // 1. Create User/Customer in DB (Simulated)
    const newCustomerId = `cust_${Date.now()}`;
    // TODO: INSERT INTO customers ...

    // 2. Create Stripe Customer
    let stripeCustomerId;
    try {
        stripeCustomerId = await createStripeCustomer(email, company);
    } catch (e) {
        console.error("Stripe Error", e);
        return reply.code(500).send({ success: false, message: 'Payment provider error' });
    }

    // 3. If Upselling, Create Checkout Session
    if (addonLines || addonNumber) {
        const checkoutUrl = await createRegistrationCheckout(
            stripeCustomerId,
            newCustomerId,
            'http://localhost:8080/dashboard?success=true', // Success URL
            'http://localhost:8080/register?canceled=true', // Cancel URL
            { addonLines, addonNumber }
        );
        return { success: true, checkoutUrl };
    }

    // 4. No Upselling, Standard Welcome
    await sendWelcomeEmail(email, company);
    return { success: true, message: 'User registered.' };
});

fastify.post('/api/auth/login', async (req, reply) => {
    // TODO: Validate credentials
    return { success: true, token: 'mock_jwt_token' };
});

fastify.post('/api/admin/email/send', async (req, reply) => {
    // Admin only
    const { to, subject, body } = req.body as any;
    const success = await sendEmail(to, subject, body);
    return { success };
});

// --- CUSTOMER MANAGEMENT ---

fastify.post('/api/customers/:id/status', async (req, reply) => {
    const { id } = req.params as any;
    const { status } = req.body as any; // 'active', 'suspended', 'inactive'

    console.log(`[Admin] Updating status for ${id} to ${status}`);
    // TODO: UPDATE customers SET status = $1 WHERE id = $2
    return { success: true, status };
});


// --- STRIPE ROUTES ---

fastify.post('/api/stripe/checkout', async (req, reply) => {
    const { customerId, priceId } = req.body as any;
    const url = await createCheckoutSession(customerId, priceId, 'http://localhost:8080/success', 'http://localhost:8080/cancel');
    return { url };
});

fastify.post('/api/stripe/extra-line', async (req, reply) => {
    const { customerId, priceAmount } = req.body as any;
    const url = await createExtraLineCheckout(customerId, priceAmount, 'http://localhost:8080/settings');
    return { url };
});

fastify.post('/api/stripe/webhook', async (req, reply) => {
    const signature = req.headers['stripe-signature'] as string;
    try {
        await handleStripeWebhook(req.body, signature);
        return { received: true };
    } catch (err: any) {
        reply.code(400).send(`Webhook Error: ${err.message}`);
    }
});

// --- TWILIO ROUTES ---

// Twilio Webhook for Voice
fastify.all('/webhook/:botId', async (request, reply) => {
    const { botId } = request.params as any;
    const streamUrl = `wss://${request.hostname}/media-stream/${botId}`;
    
    reply.type('text/xml');
    return `
    <Response>
        <Say>Verbindung zu Voice Omni wird hergestellt.</Say>
        <Connect>
            <Stream url="${streamUrl}" />
        </Connect>
    </Response>
    `;
});

// WebSocket Handler for Media Stream
fastify.register(async (fastify) => {
    fastify.get('/media-stream/:botId', { websocket: true }, async (connection: any, req: any) => {
        const { botId } = req.params as any;
        console.log(`[WS] Connection received for Bot ${botId}`);
        
        const canConnect = await checkLineAvailability('cust_dummy_123');
        if (!canConnect) {
            console.log("Line limit reached.");
            connection.socket.close();
            return;
        }

        try {
            await handleGeminiStream(connection.socket, botId);
        } catch (e) {
            console.error("Gemini Stream Error", e);
            connection.socket.close();
        } finally {
            await releaseLine('cust_dummy_123');
        }
    });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    (process as any).exit(1);
  }
};

start();

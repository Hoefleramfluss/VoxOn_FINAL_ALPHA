
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16' as any,
});

// 1. Create a Customer in Stripe
export async function createStripeCustomer(email: string, name: string) {
    const customer = await stripe.customers.create({
        email,
        name,
    });
    return customer.id;
}

// 2. Create Checkout for Registration with Upselling (Addons)
export async function createRegistrationCheckout(
    stripeCustomerId: string, 
    appCustomerId: string,
    successUrl: string, 
    cancelUrl: string,
    options: { addonLines: boolean, addonNumber: boolean }
) {
    const lineItems = [];
    
    // Add Base Plan (Simulated or Real ID)
    // For demo, we are using ad-hoc price items
    
    if (options.addonLines) {
        lineItems.push({
            price_data: {
                currency: 'eur',
                product_data: { name: 'Addon: 2 Extra Lines' },
                unit_amount: 5000, // €50.00
                recurring: { interval: 'month' }
            },
            quantity: 1,
        });
    }

    if (options.addonNumber) {
        lineItems.push({
            price_data: {
                currency: 'eur',
                product_data: { name: 'Addon: Premium Number Reservation' },
                unit_amount: 1500, // €15.00
                recurring: { interval: 'month' }
            },
            quantity: 1,
        });
    }

    // If no upselling, maybe just a card validation or base plan setup
    // For this flow, we assume this is called ONLY if there are paid items.
    
    const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: lineItems as any[],
        metadata: {
            appCustomerId: appCustomerId,
            action: 'registration_upsell'
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
    });
    
    return session.url;
}

// Create a new Checkout Session for subscription (Standard Plan)
export async function createCheckoutSession(customerId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        // Map internal customer ID to Stripe metadata
        metadata: {
            appCustomerId: customerId
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
    });
    
    return session.url;
}

// Create Checkout for One-Time Extra Line (Post-registration)
export async function createExtraLineCheckout(customerId: string, priceAmount: number, successUrl: string) {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'eur',
                    product_data: { name: 'Extra Concurrent Voice Line' },
                    unit_amount: priceAmount * 100, // cents
                    recurring: { interval: 'month' }
                },
                quantity: 1,
            },
        ],
        metadata: {
            appCustomerId: customerId,
            action: 'add_line'
        },
        success_url: successUrl,
        cancel_url: successUrl, // Return to app even if canceled
    });

    return session.url;
}

export async function handleStripeWebhook(payload: any, signature: string) {
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            payload, 
            signature, 
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err: any) {
        throw new Error(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            await handleSuccessfulPayment(session);
            break;
        
        case 'invoice.payment_succeeded':
            const invoiceSuccess = event.data.object as Stripe.Invoice;
            await handleInvoicePaid(invoiceSuccess);
            break;
            
        case 'invoice.payment_failed':
            const invoiceFailed = event.data.object as Stripe.Invoice;
            await handleFailedPayment(invoiceFailed);
            break;
            
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
    const appCustomerId = session.metadata?.appCustomerId;
    const action = session.metadata?.action;
    
    if (!appCustomerId) return;
    
    console.log(`[Stripe] Payment Success for Customer ${appCustomerId}`);

    if (action === 'add_line') {
        // SQL: UPDATE plans SET max_lines = max_lines + 1 WHERE customer_id = appCustomerId
        console.log(`[Stripe] Provisioning EXTRA LINE for ${appCustomerId}`);
        // TODO: Execute DB Update
    } else if (action === 'registration_upsell') {
        console.log(`[Stripe] Registration Upsell Paid for ${appCustomerId}. Activating account.`);
        // TODO: Execute DB Update: SET status = 'active'
    } else {
        console.log(`[Stripe] Activating Plan for ${appCustomerId}`);
        // TODO: Execute DB Update: SET status = 'active'
    }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
    // If a recurring payment succeeds, ensure the customer is UNBLOCKED
    // Retrieve customer from subscription metadata or invoice customer email lookup
    console.log(`[Stripe] Invoice Paid: ${invoice.id}. Unblocking customer...`);
    // TODO: Lookup Customer by Stripe Customer ID
    // SQL: UPDATE customers SET status = 'active' WHERE stripe_id = ...
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
    // Logic to suspend customer
    console.log(`[Stripe] Payment FAILED for invoice ${invoice.id}. Suspending customer...`);
    // TODO: Lookup Customer
    // SQL: UPDATE customers SET status = 'suspended' WHERE stripe_id = ...
}

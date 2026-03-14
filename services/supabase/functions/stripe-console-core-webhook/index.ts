import Stripe from 'npm:stripe@18.4.0';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';
import {
  corsHeaders,
  headerMap,
  json,
  optional,
  readRawBody,
  required,
  safeJsonParse,
} from '../_shared/console-core-provider-webhooks.ts';

function mapSubscriptionStatus(status: string | null | undefined): string {
  if (status === 'trialing') return 'trialing';
  if (status === 'active') return 'active';
  if (status === 'past_due') return 'past_due';
  if (status === 'paused') return 'paused';
  if (status === 'canceled' || status === 'unpaid' || status === 'incomplete_expired') return 'canceled';
  return 'incomplete';
}

function mapInvoiceStatus(status: string | null | undefined): string {
  if (status === 'paid') return 'paid';
  if (status === 'void') return 'void';
  if (status === 'uncollectible') return 'uncollectible';
  if (status === 'open') return 'open';
  return 'draft';
}

function mapPaymentStatusFromEvent(type: string): string {
  if (type === 'payment_intent.succeeded') return 'paid';
  if (type === 'payment_intent.payment_failed') return 'failed';
  if (type === 'payment_intent.canceled') return 'voided';
  return 'pending';
}

function mapPayoutStatus(status: string | null | undefined): string {
  if (status === 'paid') return 'paid';
  if (status === 'failed') return 'failed';
  if (status === 'canceled') return 'canceled';
  return 'pending';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let supabaseUrl = '';
  let serviceRoleKey = '';
  let eventIdForFailure: string | null = null;

  try {
    supabaseUrl = required('SUPABASE_URL');
    serviceRoleKey = required('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = optional('STRIPE_SECRET_KEY');
    const webhookSecret = optional('STRIPE_CONSOLE_CORE_WEBHOOK_SECRET') || optional('STRIPE_WEBHOOK_SECRET');
    const rawBody = await readRawBody(req);
    const signature = req.headers.get('stripe-signature') ?? '';

    let event: Stripe.Event;
    let verified = false;

    if (webhookSecret) {
      if (!stripeSecretKey) {
        return json({ error: 'Missing STRIPE_SECRET_KEY for webhook verification' }, 500);
      }
      const stripe = new Stripe(stripeSecretKey);
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      verified = true;
    } else {
      const parsed = safeJsonParse<Stripe.Event>(rawBody);
      if (!parsed) {
        return json({ error: 'Invalid JSON payload' }, 400);
      }
      event = parsed;
    }
    eventIdForFailure = event.id;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const accountId = event.account ?? null;
    let billingAccountId: string | null = null;

    if (accountId) {
      const { data: billingAccount } = await supabase
        .from('billing_accounts')
        .select('billing_account_id')
        .eq('stripe_connected_account_id', accountId)
        .maybeSingle();
      billingAccountId = billingAccount?.billing_account_id ?? null;
    }

    await supabase.from('stripe_webhook_events').upsert({
      billing_account_id: billingAccountId,
      stripe_event_id: event.id,
      stripe_account_id: accountId,
      event_type: event.type,
      livemode: event.livemode,
      verified,
      processed_status: 'received',
      event_headers: headerMap(req),
      payload: event,
    }, { onConflict: 'stripe_event_id' });

    if (event.type.startsWith('customer.subscription.')) {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: billingAccount } = await supabase
        .from('billing_accounts')
        .select('billing_account_id, billing_owner_type')
        .eq('stripe_customer_id', typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id ?? '')
        .maybeSingle();
      if (billingAccount?.billing_account_id) {
        await supabase.from('billing_subscriptions').upsert({
          billing_account_id: billingAccount.billing_account_id,
          subscription_scope:
            billingAccount.billing_owner_type === 'organization'
              ? 'organization_plan'
              : 'professional_plan',
          subscription_status: mapSubscriptionStatus(subscription.status),
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0]?.price?.id ?? null,
          current_period_start: subscription.items.data[0]?.current_period_start ? new Date(subscription.items.data[0].current_period_start * 1000).toISOString() : null,
          current_period_end: subscription.items.data[0]?.current_period_end ? new Date(subscription.items.data[0].current_period_end * 1000).toISOString() : null,
          cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
          metadata: subscription.metadata ?? {},
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' });
      }
    }

    if (event.type.startsWith('invoice.')) {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? null;
      const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id ?? null;
      const { data: billingAccount } = customerId
        ? await supabase.from('billing_accounts').select('billing_account_id, organization_id, professional_profile_id').eq('stripe_customer_id', customerId).maybeSingle()
        : { data: null };
      await supabase.from('billing_invoice_records').upsert({
        billing_account_id: billingAccount?.billing_account_id ?? null,
        organization_id: billingAccount?.organization_id ?? null,
        professional_profile_id: billingAccount?.professional_profile_id ?? null,
        invoice_status: mapInvoiceStatus(invoice.status),
        stripe_invoice_id: invoice.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        amount_due_minor: invoice.amount_due ?? 0,
        amount_paid_minor: invoice.amount_paid ?? 0,
        currency: invoice.currency ?? 'usd',
        hosted_invoice_url: invoice.hosted_invoice_url ?? null,
        invoice_pdf_url: invoice.invoice_pdf ?? null,
        due_at: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
        paid_at: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : null,
        metadata: invoice.metadata ?? {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_invoice_id' });
    }

    if (event.type.startsWith('payment_intent.')) {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from('payment_transactions')
        .update({
          payment_status: mapPaymentStatusFromEvent(event.type),
          occurred_at: new Date().toISOString(),
          metadata: paymentIntent.metadata ?? {},
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);
    }

    if (event.type === 'payout.paid' || event.type === 'payout.failed' || event.type === 'payout.canceled') {
      const payout = event.data.object as Stripe.Payout;
      await supabase.from('payout_records').upsert({
        billing_account_id: billingAccountId,
        payout_status: mapPayoutStatus(payout.status),
        stripe_payout_id: payout.id,
        stripe_connected_account_id: accountId,
        amount_minor: payout.amount ?? 0,
        currency: payout.currency ?? 'usd',
        arrived_at: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null,
        failure_code: payout.failure_code ?? null,
        failure_message: payout.failure_message ?? null,
        metadata: payout.metadata ?? {},
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_payout_id' });
    }

    await supabase
      .from('stripe_webhook_events')
      .update({
        processed_status: 'processed',
        processed_at: new Date().toISOString(),
      })
      .eq('stripe_event_id', event.id);

    return json({
      ok: true,
      provider: 'stripe',
      verified,
      eventType: event.type,
      eventId: event.id,
    });
  } catch (error) {
    try {
      if (supabaseUrl && serviceRoleKey && eventIdForFailure) {
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false },
        });
        await supabase
          .from('stripe_webhook_events')
          .update({
            processed_status: 'failed',
            error_code: 'webhook_processing_failed',
            error_message: error instanceof Error ? error.message : 'Unknown Stripe webhook error',
            processed_at: new Date().toISOString(),
          })
          .eq('stripe_event_id', eventIdForFailure);
      }
    } catch {
      // Preserve the original webhook failure even if the audit update itself fails.
    }
    const message = error instanceof Error ? error.message : 'Unknown Stripe webhook error';
    const status = message.toLowerCase().includes('signature') ? 400 : 500;
    return json({ error: message }, status);
  }
});

import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function GET(req: Request) {
  try {
    console.log("🔍 Fetching payments from Stripe...");

    // Get payment intents from Stripe (last 100 payments)
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 100,
    });

    console.log(
      `📊 Found ${paymentIntents.data.length} payment intents from Stripe`
    );

    // Get charges for each payment intent to get complete payment data
    const paymentsWithCharges = await Promise.all(
      paymentIntents.data.map(async (paymentIntent) => {
        try {
          const charges = await stripe.charges.list({
            payment_intent: paymentIntent.id,
            limit: 1,
          });
          return { paymentIntent, charge: charges.data[0] };
        } catch (error) {
          console.log(`⚠️ No charges found for payment ${paymentIntent.id}`);
          return { paymentIntent, charge: null };
        }
      })
    );

    // Transform to a clean format with only essential data
    const payments = paymentsWithCharges.map(({ paymentIntent, charge }) => ({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      created: new Date(paymentIntent.created * 1000).toISOString(),
      customer_email:
        charge?.receipt_email || charge?.billing_details?.email || "",
      customer_name: charge?.billing_details?.name || "",
      charge_status: charge?.status || "unknown",
      amount_captured: charge?.amount_captured || 0,
      metadata: paymentIntent.metadata || {},
    }));

    // Filter only successful payments
    const successfulPayments = payments.filter(
      (payment) =>
        payment.status === "succeeded" &&
        payment.charge_status === "succeeded" &&
        payment.amount_captured > 0
    );

    console.log(`✅ Found ${successfulPayments.length} successful payments`);

    return NextResponse.json({
      success: true,
      total: payments.length,
      successful: successfulPayments.length,
      payments: successfulPayments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        customer_email: payment.customer_email,
        customer_name: payment.customer_name,
        created: payment.created,
        hasMetadata: Object.keys(payment.metadata).length > 0,
        metadata: payment.metadata,
      })),
      message: `Found ${successfulPayments.length} successful payments`,
    });
  } catch (error: any) {
    console.error("❌ Error fetching Stripe payments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Stripe payments",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

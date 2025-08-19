import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  processPaymentVerification,
  PaymentData,
} from "@/app/api/handlers/paymentVerification";

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

    // Transform to a clean format
    const payments: PaymentData[] = paymentsWithCharges.map(
      ({ paymentIntent, charge }) => ({
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        created: new Date(paymentIntent.created * 1000).toISOString(),
        customer_email:
          charge?.receipt_email || charge?.billing_details?.email || "",
        customer_name: charge?.billing_details?.name || "",
        charge_id: charge?.id || "",
        charge_status: charge?.status || "unknown",
        payment_method: charge?.payment_method || "",
        receipt_url: charge?.receipt_url || "",
        amount_captured: charge?.amount_captured || 0,
        payment_outcome: charge?.outcome || null,
        metadata: paymentIntent.metadata || null,
      })
    );

    console.log(`✅ Successfully processed ${payments.length} payments`);

    // Process payment verification and update user tiers
    const verificationResults = await processPaymentVerification(payments);

    console.log(`✅ Payment verification and tier updates completed:`);
    console.log(`   - Total: ${verificationResults.total}`);
    console.log(`   - Successful: ${verificationResults.successful}`);
    console.log(`   - Failed: ${verificationResults.failed}`);
    console.log(`   - Users Updated: ${verificationResults.updatedUsers}`);

    return NextResponse.json({
      success: true,
      data: payments,
      count: payments.length,
      verification: verificationResults,
      timestamp: new Date().toISOString(),
      message: `Successfully fetched ${payments.length} payments from Stripe`,
    });
  } catch (error: any) {
    console.error("❌ Error fetching Stripe payments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Stripe payments",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

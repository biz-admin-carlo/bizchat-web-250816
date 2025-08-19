import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export async function POST(req: Request) {
  try {
    const { amount, description, customerEmail, tenantId, metadata } =
      await req.json();

    if (!amount || !description) {
      return NextResponse.json(
        { error: "Amount and description are required" },
        { status: 400 }
      );
    }

    console.log(
      `💳 Creating checkout session for ${amount} cents: ${description}`
    );

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: description,
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/register-success?session_id={CHECKOUT_SESSION_ID}&tenantId=${
        tenantId || ""
      }`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/pricing-selection`,
      customer_email: customerEmail, // Pre-fill customer email if provided
      metadata: {
        description: description,
        amount: amount.toString(),
        tenantId: tenantId || "",
        adminEmail: metadata?.adminEmail || customerEmail || "",
        selectedTier: metadata?.selectedTier || "",
        additionalCompanies: metadata?.additionalCompanies || "",
        additionalMembers: metadata?.additionalMembers || "",
        companyName: metadata?.companyName || "",
      },
    });

    console.log(`✅ Created checkout session: ${session.id}`);

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error("❌ Error creating checkout session:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create checkout session",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

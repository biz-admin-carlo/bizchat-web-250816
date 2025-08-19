import { NextResponse } from "next/server";
import { db } from "@/app/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking tier for user: ${email}`);

    // Find user by email
    const userDoc = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (userDoc.empty) {
      return NextResponse.json({
        success: false,
        message: `User not found with email: ${email}`,
        tier: "free",
      });
    }

    const userId = userDoc.docs[0].id;
    const userData = userDoc.docs[0].data();

    // Get user's subscription tier
    const subscriptionDoc = await db
      .collection("users")
      .doc(userId)
      .collection("payments")
      .doc("subscriptions")
      .get();

    let tier = "free";
    let subscriptionData = null;

    if (subscriptionDoc.exists) {
      subscriptionData = subscriptionDoc.data();
      // Handle different tier naming conventions
      if (subscriptionData?.tier === "paid") {
        // If it's marked as "paid", check for specific tier information
        tier =
          subscriptionData?.selectedTier ||
          subscriptionData?.planType ||
          "base";
      } else {
        tier = subscriptionData?.tier || "free";
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        tier: tier,
        subscriptionData: {
          ...subscriptionData,
          // Add computed fields for easier frontend consumption
          subscriptionId:
            subscriptionData?.paymentId || subscriptionData?.subscriptionId,
          status: subscriptionData?.tier === "paid" ? "active" : "inactive",
          nextBillingDate:
            subscriptionData?.nextBillingDate || subscriptionData?.billingDate,
          amount:
            subscriptionData?.amount ||
            (tier === "base" ? 2500 : tier === "white-label" ? 5500 : 0),
          // Additional options
          additionalCompanies: subscriptionData?.numAddnalCompanies || 0,
          additionalMembers: subscriptionData?.numAddnalMembers || 0,
        },
      },
      message: `User tier: ${tier}`,
    });
  } catch (error: any) {
    console.error("Error checking user tier:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check user tier",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

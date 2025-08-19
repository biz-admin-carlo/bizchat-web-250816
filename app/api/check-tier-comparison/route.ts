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

    console.log(`🔍 Checking tier comparison for email: ${email}`);

    // Find user by email
    const userDocs = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (userDocs.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userDocs.docs[0];
    const userData = user.data();
    const userId = user.id;
    const tenantId = userData.companyId;

    console.log(`✅ Found user: ${userId}`);
    console.log(`✅ User's tenant ID: ${tenantId}`);

    // Get user's subscription tier
    const userSubscriptionDoc = await db
      .collection("users")
      .doc(userId)
      .collection("payments")
      .doc("subscriptions")
      .get();

    let userTier = "not found";
    let userSubscriptionData = null;

    if (userSubscriptionDoc.exists) {
      userSubscriptionData = userSubscriptionDoc.data();
      userTier = userSubscriptionData?.tier || "not set";
    }

    // Get tenant's subscription tier
    const tenantSubscriptionDoc = await db
      .collection("tenants")
      .doc(tenantId)
      .collection("payments")
      .doc("subscriptions")
      .get();

    let tenantTier = "not found";
    let tenantSubscriptionData = null;

    if (tenantSubscriptionDoc.exists) {
      tenantSubscriptionData = tenantSubscriptionDoc.data();
      tenantTier = tenantSubscriptionData?.tier || "not set";
    }

    // Get tenant document
    const tenantDoc = await db.collection("tenants").doc(tenantId).get();
    let tenantData = null;

    if (tenantDoc.exists) {
      tenantData = tenantDoc.data();
    }

    console.log(`📊 Tier Comparison:`);
    console.log(`   User Tier: ${userTier}`);
    console.log(`   Tenant Tier: ${tenantTier}`);

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        companyId: userData.companyId,
        tier: userTier,
        subscriptionData: userSubscriptionData,
      },
      tenant: {
        id: tenantId,
        companyName: tenantData?.companyName,
        adminEmail: tenantData?.adminEmail,
        tier: tenantTier,
        subscriptionData: tenantSubscriptionData,
      },
      comparison: {
        userTier,
        tenantTier,
        tiersMatch: userTier === tenantTier,
      },
      message: `User tier: ${userTier}, Tenant tier: ${tenantTier}`,
    });
  } catch (error: any) {
    console.error("❌ Error checking tier comparison:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check tier comparison",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

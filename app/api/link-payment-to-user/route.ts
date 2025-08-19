import { NextResponse } from "next/server";
import { db } from "@/app/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: Request) {
  try {
    const { paymentId, tenantId } = await req.json();

    if (!paymentId || !tenantId) {
      return NextResponse.json(
        { error: "Payment ID and Tenant ID are required" },
        { status: 400 }
      );
    }

    console.log(`🔗 Linking payment ${paymentId} to tenant ${tenantId}`);

    // Get tenant document to find admin email
    const tenantDoc = await db.collection("tenants").doc(tenantId).get();

    if (!tenantDoc.exists) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const tenantData = tenantDoc.data();
    const adminEmail = tenantData?.adminEmail;

    if (!adminEmail) {
      return NextResponse.json(
        { error: "No admin email found in tenant" },
        { status: 404 }
      );
    }

    console.log(`✅ Found admin email: ${adminEmail}`);

    // Find user with this admin email
    const userDocs = await db
      .collection("users")
      .where("email", "==", adminEmail)
      .get();

    if (userDocs.empty) {
      return NextResponse.json(
        { error: "User not found with admin email" },
        { status: 404 }
      );
    }

    const user = userDocs.docs[0];
    const userId = user.id;

    console.log(`✅ Found user: ${userId}`);

    // Update user subscription tier to paid
    await db
      .collection("users")
      .doc(userId)
      .collection("payments")
      .doc("subscriptions")
      .set(
        {
          tier: "paid",
          paymentId: paymentId,
          linkedManually: true,
          linkedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    // Also update tenant subscription tier
    await db
      .collection("tenants")
      .doc(tenantId)
      .collection("payments")
      .doc("subscriptions")
      .set(
        {
          tier: "paid",
          paymentId: paymentId,
          linkedManually: true,
          linkedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    console.log(
      `✅ Successfully linked payment ${paymentId} to user ${userId} and tenant ${tenantId}`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully linked payment ${paymentId} to user ${userId} and tenant ${tenantId}`,
      user: {
        id: userId,
        email: adminEmail,
      },
      tenant: {
        id: tenantId,
        companyName: tenantData?.companyName,
      },
    });
  } catch (error: any) {
    console.error("❌ Error linking payment to user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to link payment to user",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

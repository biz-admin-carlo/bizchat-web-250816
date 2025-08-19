import { db } from "@/app/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: string;
  customer_email: string;
  customer_name: string;
  charge_id: string;
  charge_status: string;
  payment_method: string;
  receipt_url: string;
  amount_captured: number;
  payment_outcome: any;
  metadata?: {
    adminEmail?: string;
    tenantId?: string;
    selectedTier?: string;
    additionalCompanies?: string;
    additionalMembers?: string;
    companyName?: string;
  };
}

export interface PaymentVerificationResult {
  paymentId: string;
  customerEmail: string;
  isSuccessful: boolean;
  reasons: string[];
  amount: number;
  currency: string;
  created: string;
}

/**
 * Check if a payment is successful based on multiple criteria
 */
export function isPaymentSuccessful(
  payment: PaymentData
): PaymentVerificationResult {
  const reasons: string[] = [];
  let isSuccessful = true;

  // 1. Check payment intent status
  const successStatuses = ["succeeded", "processing"];
  if (!successStatuses.includes(payment.status)) {
    reasons.push(
      `Payment intent status is "${payment.status}", expected "succeeded" or "processing"`
    );
    isSuccessful = false;
  }

  // 2. Check charge status
  if (payment.charge_status !== "succeeded") {
    reasons.push(
      `Charge status is "${payment.charge_status}", expected "succeeded"`
    );
    isSuccessful = false;
  }

  // 3. Check if amount is valid (greater than 0)
  if (!payment.amount || payment.amount <= 0) {
    reasons.push(`Payment amount is ${payment.amount}, must be greater than 0`);
    isSuccessful = false;
  }

  // 4. Check if amount was captured
  if (payment.amount_captured <= 0) {
    reasons.push(
      `Amount captured is ${payment.amount_captured}, must be greater than 0`
    );
    isSuccessful = false;
  }

  // 5. Check payment outcome
  if (payment.payment_outcome) {
    const outcome = payment.payment_outcome;
    if (outcome.type !== "authorized") {
      reasons.push(
        `Payment outcome type is "${outcome.type}", expected "authorized"`
      );
      isSuccessful = false;
    }

    if (outcome.network_status !== "approved_by_network") {
      reasons.push(
        `Network status is "${outcome.network_status}", expected "approved_by_network"`
      );
      isSuccessful = false;
    }
  }

  // 6. Check if customer email exists (for user lookup)
  if (!payment.customer_email) {
    reasons.push("No customer email found for user lookup");
    // Don't mark as failed, just warn
  }

  return {
    paymentId: payment.id,
    customerEmail: payment.metadata?.adminEmail || payment.customer_email,
    isSuccessful,
    reasons,
    amount: payment.amount,
    currency: payment.currency,
    created: payment.created,
  };
}

/**
 * Verify multiple payments and return results
 */
export function verifyPayments(
  payments: PaymentData[]
): PaymentVerificationResult[] {
  return payments.map(isPaymentSuccessful);
}

/**
 * Look up user ID by email (registration email)
 * Prioritizes recently created users to ensure we update the correct user
 */
export async function lookupUserIdByEmail(
  email: string
): Promise<string | null> {
  try {
    // Get all users with this email
    const userDocs = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (!userDocs.empty) {
      // If multiple users found, get the most recently created one
      if (userDocs.docs.length > 1) {
        const sortedUsers = userDocs.docs.sort((a, b) => {
          const aTime = a.data().createdAt?.toDate?.() || new Date(0);
          const bTime = b.data().createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
        const mostRecentUser = sortedUsers[0];
        console.log(
          `✅ Found ${userDocs.docs.length} users with email: ${email}, using most recent (ID: ${mostRecentUser.id})`
        );
        return mostRecentUser.id;
      } else {
        const user = userDocs.docs[0];
        console.log(
          `✅ Found user with registration email: ${email} (ID: ${user.id})`
        );
        return user.id;
      }
    }

    // If no exact match, try case-insensitive search
    const allUsers = await db.collection("users").get();
    const matchingUsers = allUsers.docs.filter((doc) => {
      const userEmail = doc.data().email;
      return userEmail && userEmail.toLowerCase() === email.toLowerCase();
    });

    if (matchingUsers.length > 0) {
      // Sort by creation date and get the most recent
      const sortedUsers = matchingUsers.sort((a, b) => {
        const aTime = a.data().createdAt?.toDate?.() || new Date(0);
        const bTime = b.data().createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

      const mostRecentUser = sortedUsers[0];
      console.log(
        `✅ Found user with case-insensitive email match: ${email} (ID: ${
          mostRecentUser.id
        }, created: ${mostRecentUser.data().createdAt})`
      );
      return mostRecentUser.id;
    }

    console.log(`⚠️ User not found for email: ${email}`);
    return null;
  } catch (error) {
    console.error(`Error looking up user by email ${email}:`, error);
    return null;
  }
}

/**
 * Look up admin email by tenant ID
 */
export async function lookupAdminEmailByTenantId(
  tenantId: string
): Promise<string | null> {
  try {
    console.log(`🔍 Looking up admin email for tenant: ${tenantId}`);

    const tenantDoc = await db.collection("tenants").doc(tenantId).get();

    if (tenantDoc.exists) {
      const tenantData = tenantDoc.data();
      const adminEmail = tenantData?.adminEmail;

      if (adminEmail) {
        console.log(
          `✅ Found admin email for tenant ${tenantId}: ${adminEmail}`
        );
        return adminEmail;
      } else {
        console.log(`⚠️ No admin email found in tenant ${tenantId}`);
        return null;
      }
    } else {
      console.log(`⚠️ Tenant not found: ${tenantId}`);
      return null;
    }
  } catch (error) {
    console.error(
      `Error looking up admin email for tenant ${tenantId}:`,
      error
    );
    return null;
  }
}

/**
 * Look up user ID by tenant ID (using admin email from tenant document)
 */
export async function lookupUserIdByTenantId(
  tenantId: string
): Promise<string | null> {
  try {
    console.log(`🔍 Looking up user for tenant: ${tenantId}`);

    // First get the admin email from the tenant document
    const adminEmail = await lookupAdminEmailByTenantId(tenantId);

    if (!adminEmail) {
      console.log(`⚠️ No admin email found for tenant ${tenantId}`);
      return null;
    }

    // Now find the user with this admin email
    const userDocs = await db
      .collection("users")
      .where("email", "==", adminEmail)
      .get();

    if (!userDocs.empty) {
      // If multiple users found, get the most recently created one
      if (userDocs.docs.length > 1) {
        const sortedUsers = userDocs.docs.sort((a, b) => {
          const aTime = a.data().createdAt?.toDate?.() || new Date(0);
          const bTime = b.data().createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
        const mostRecentUser = sortedUsers[0];
        console.log(
          `✅ Found ${userDocs.docs.length} users with admin email: ${adminEmail}, using most recent (ID: ${mostRecentUser.id})`
        );
        return mostRecentUser.id;
      } else {
        const user = userDocs.docs[0];
        console.log(
          `✅ Found user with admin email: ${adminEmail} (ID: ${user.id})`
        );
        return user.id;
      }
    }

    console.log(`⚠️ User not found with admin email: ${adminEmail}`);
    return null;
  } catch (error) {
    console.error(`Error looking up user for tenant ${tenantId}:`, error);
    return null;
  }
}

/**
 * Update user tier to paid
 */
export async function updateUserTierToPaid(
  userId: string,
  payment: PaymentData
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🔄 Updating tier to paid for user: ${userId}`);

    // Get user data to find tenant ID
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new Error("User document not found");
    }

    const userData = userDoc.data();
    const tenantId = userData?.companyId;

    if (!tenantId) {
      throw new Error("User has no associated tenant");
    }

    console.log(`🔄 Found tenant ID: ${tenantId}`);

    // Update user subscription tier
    await db
      .collection("users")
      .doc(userId)
      .collection("payments")
      .doc("subscriptions")
      .set(
        {
          tier: "paid",
          paymentId: payment.id,
          paymentAmount: payment.amount,
          paymentCurrency: payment.currency,
          paymentMethod: payment.payment_method || "stripe",
          paymentDate: payment.created,
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
          paymentId: payment.id,
          paymentAmount: payment.amount,
          paymentCurrency: payment.currency,
          paymentMethod: payment.payment_method || "stripe",
          paymentDate: payment.created,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    console.log(
      `✅ Successfully updated tier to paid for user: ${userId} and tenant: ${tenantId}`
    );
    return {
      success: true,
      message: `Successfully updated tier to paid for user: ${userId} and tenant: ${tenantId}`,
    };
  } catch (error) {
    console.error(`❌ Error updating tier for user ${userId}:`, error);
    return {
      success: false,
      message: `Failed to update tier for user ${userId}: ${
        (error as Error).message
      }`,
    };
  }
}

/**
 * Update user tier to free (for failed payments)
 */
export async function updateUserTierToFree(
  userId: string,
  payment: PaymentData
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`🔄 Updating tier to free for user: ${userId}`);

    // Get user data to find tenant ID
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      throw new Error("User document not found");
    }

    const userData = userDoc.data();
    const tenantId = userData?.companyId;

    if (!tenantId) {
      throw new Error("User has no associated tenant");
    }

    console.log(`🔄 Found tenant ID: ${tenantId}`);

    // Update user subscription tier
    await db
      .collection("users")
      .doc(userId)
      .collection("payments")
      .doc("subscriptions")
      .set(
        {
          tier: "free",
          lastFailedPaymentId: payment.id,
          lastFailedPaymentAmount: payment.amount,
          lastFailedPaymentDate: payment.created,
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
          tier: "free",
          lastFailedPaymentId: payment.id,
          lastFailedPaymentAmount: payment.amount,
          lastFailedPaymentDate: payment.created,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    console.log(
      `✅ Successfully updated tier to free for user: ${userId} and tenant: ${tenantId}`
    );
    return {
      success: true,
      message: `Successfully updated tier to free for user: ${userId} and tenant: ${tenantId}`,
    };
  } catch (error) {
    console.error(`❌ Error updating tier for user ${userId}:`, error);
    return {
      success: false,
      message: `Failed to update tier for user ${userId}: ${
        (error as Error).message
      }`,
    };
  }
}

/**
 * Process payment verification and update user tiers
 */
export async function processPaymentVerification(
  payments: PaymentData[]
): Promise<{
  total: number;
  successful: number;
  failed: number;
  updatedUsers: number;
  results: Array<
    PaymentVerificationResult & {
      tierUpdate?: { success: boolean; message: string };
    }
  >;
}> {
  const verificationResults = verifyPayments(payments);
  let updatedUsers = 0;

  // Log all available user emails for debugging
  console.log("🔍 Available user emails in database:");
  try {
    const allUsers = await db.collection("users").get();
    const userEmails = allUsers.docs
      .map((doc) => doc.data().email)
      .filter(Boolean);
    console.log("   -", userEmails.join(", "));
  } catch (error) {
    console.log("   - Could not fetch user emails");
  }

  // Process each payment
  const processedResults = await Promise.all(
    verificationResults.map(async (result) => {
      // Find the corresponding payment data to get metadata
      const payment = payments.find((p) => p.id === result.paymentId);

      // Get user ID from multiple sources in order of priority:
      // 1. Metadata admin email (from checkout) - find user by email
      // 2. Tenant ID (from metadata) - find user by tenant document admin email
      // 3. Stripe customer email (fallback) - find user by email
      let userId: string | null = null;

      if (payment?.metadata?.adminEmail) {
        // Use admin email from metadata to find user
        console.log(
          `🔍 Looking for user with admin email from metadata: ${payment.metadata.adminEmail}`
        );
        userId = await lookupUserIdByEmail(payment.metadata.adminEmail);
      } else if (payment?.metadata?.tenantId) {
        // Use tenant ID to find user via tenant document admin email
        console.log(
          `🔍 Looking for user with tenant ID: ${payment.metadata.tenantId}`
        );
        userId = await lookupUserIdByTenantId(payment.metadata.tenantId);
      } else if (result.customerEmail) {
        // Fallback to Stripe customer email
        console.log(
          `🔍 Looking for user with Stripe customer email: ${result.customerEmail}`
        );
        userId = await lookupUserIdByEmail(result.customerEmail);
      }

      console.log(`🔍 Processing payment: ${result.paymentId}`);
      console.log(`   Stripe Customer Email: ${result.customerEmail}`);
      console.log(
        `   Metadata Admin Email: ${payment?.metadata?.adminEmail || "none"}`
      );
      console.log(`   Tenant ID: ${payment?.metadata?.tenantId || "none"}`);
      console.log(
        `   User lookup method: ${
          payment?.metadata?.adminEmail
            ? "admin email from metadata"
            : payment?.metadata?.tenantId
            ? "tenant ID from metadata"
            : "Stripe customer email"
        }`
      );

      if (!userId) {
        return {
          ...result,
          tierUpdate: { success: false, message: "No user found" },
        };
      }

      let tierUpdate;
      if (result.isSuccessful) {
        tierUpdate = await updateUserTierToPaid(
          userId,
          payments.find((p) => p.id === result.paymentId)!
        );
      } else {
        tierUpdate = await updateUserTierToFree(
          userId,
          payments.find((p) => p.id === result.paymentId)!
        );
      }

      if (tierUpdate.success) {
        updatedUsers++;
      }

      return { ...result, tierUpdate };
    })
  );

  const successful = processedResults.filter(
    (result) => result.isSuccessful
  ).length;
  const failed = processedResults.filter(
    (result) => !result.isSuccessful
  ).length;

  return {
    total: processedResults.length,
    successful,
    failed,
    updatedUsers,
    results: processedResults,
  };
}

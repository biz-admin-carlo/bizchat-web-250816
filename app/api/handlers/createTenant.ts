import { db, auth } from "@/app/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function createTenant(data: Record<string, any>) {
  try {
    // Create the tenant first
    const docRef = await db.collection("tenants").add({
      companyName: data.companyName,
      companyAddress: { address: data.companyAddress, country: data.country },
      contactDetails: {
        contactNo: data.phoneNumber,
        website: data.website,
      },
      companyCode: data.companyCode,
      companySize: data.companySize,
      ein: data.ein,
      industry: data.industry,
      adminEmail: data.adminEmail, // Add admin email to tenant document
      visitorCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    await db.collection("tenants").doc(docRef.id).update({
      companyId: docRef.id,
    });

    await db
      .collection("tenants")
      .doc(docRef.id)
      .collection("payments")
      .doc("subscriptions")
      .set({
        tier: "free",
        updatedAt: FieldValue.serverTimestamp(),
      });

    await db
      .collection("tenants")
      .doc(docRef.id)
      .collection("payments")
      .doc("cards")
      .set({
        cardName: "",
        cardNo: "",
        cvv: "",
        expiryDate: "",
        maskedCardNo: "",
      });

    // Create the admin authentication account
    let adminUid: string;
    let firstName: string;
    let lastName: string;

    // Handle both new separate fields and backward compatibility
    if (data.adminFirstName && data.adminLastName) {
      firstName = data.adminFirstName;
      lastName = data.adminLastName;
    } else if (data.adminFullName) {
      // Backward compatibility: parse from full name
      const nameParts = data.adminFullName.split(" ");
      firstName = nameParts[0] || data.adminFullName;
      lastName = nameParts.slice(1).join(" ") || "";
    } else {
      throw new Error("Admin name information is missing");
    }

    try {
      const userRecord = await auth.createUser({
        email: data.adminEmail,
        password: data.adminPassword,
        displayName: `${firstName} ${lastName}`,
        emailVerified: false,
      });
      adminUid = userRecord.uid;
    } catch (authError) {
      // If auth creation fails, clean up the tenant and return error
      await db.collection("tenants").doc(docRef.id).delete();
      throw new Error(
        `Failed to create admin account: ${(authError as Error).message}`
      );
    }

    // Store admin user information in the users collection
    await db
      .collection("users")
      .doc(adminUid)
      .set({
        firstName: firstName,
        lastName: lastName,
        email: data.adminEmail,
        tenantList: [docRef.id], // Admin is part of this tenant
        role: "admin",
        companyId: docRef.id, // Use companyId instead of tenantId
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    // Create payments subcollection with subscriptions document
    await db
      .collection("users")
      .doc(adminUid)
      .collection("payments")
      .doc("subscriptions")
      .set({
        tier: "free",
        numAddnalCompanies: data.additionalCompanies || 0,
        numAddnalMembers: data.additionalMembers || 0,
        updatedAt: FieldValue.serverTimestamp(),
      });

    return { success: true, id: docRef.id, adminUid };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

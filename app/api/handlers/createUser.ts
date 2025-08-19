import { db, auth } from "@/app/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function createUser(data: Record<string, any>) {
  try {
    // Check if user with this email already exists
    try {
      const existingUser = await auth.getUserByEmail(data.email);
      if (existingUser) {
        return { success: false, error: "User with this email already exists" };
      }
    } catch (error) {
      // User doesn't exist, which is what we want
    }

    // Create the authentication account
    let userUid: string;
    try {
      const userRecord = await auth.createUser({
        email: data.email,
        password: data.password,
        displayName: data.fullName,
        emailVerified: false,
      });
      userUid = userRecord.uid;
    } catch (authError) {
      throw new Error(
        `Failed to create user account: ${(authError as Error).message}`
      );
    }

    // Store user information in the users collection
    await db
      .collection("users")
      .doc(userUid)
      .set({
        firstName: data.fullName.split(" ")[0] || data.fullName,
        lastName: data.fullName.split(" ").slice(1).join(" ") || "",
        email: data.email,
        companyCode: data.companyCode,
        tenantList: [], // Will be populated when they join a company
        role: "support",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    return { success: true, uid: userUid };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

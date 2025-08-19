import { db } from "@/app/lib/firebaseAdmin";

export async function checkUserEmail(email: string): Promise<boolean> {
  try {
    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking user email:", error);
    throw new Error(`Failed to check user email: ${error}`);
  }
}

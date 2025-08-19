import { db } from "@/app/lib/firebaseAdmin";

export async function checkUserEmail(email: string): Promise<boolean> {
  const snapshot = await db
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();
  return !snapshot.empty;
}

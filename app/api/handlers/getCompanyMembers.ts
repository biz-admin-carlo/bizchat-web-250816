import { db } from "@/app/lib/firebaseAdmin";

export async function getCompanyMembers(tenantId: string): Promise<any[]> {
  const snapshot = await db
    .collection("users")
    .where("tenantList", "array-contains", tenantId)
    .get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    let createdAt = "";
    if (data.createdAt && typeof data.createdAt.toDate === "function") {
      createdAt = data.createdAt.toDate().toISOString();
    } else if (data.createdAt && data.createdAt._seconds) {
      createdAt = new Date(data.createdAt._seconds * 1000).toISOString();
    }
    console.log(
      "Backend createdAt raw:",
      data.createdAt,
      "converted:",
      createdAt
    );
    return {
      id: doc.id,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      createdAt,
      ...data,
    };
  });
}

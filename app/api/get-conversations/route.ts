import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const { tenantId } = await req.json();
  console.log("API: Fetching conversations for tenantId:", tenantId);
  if (!tenantId) {
    return NextResponse.json(
      { error: "tenantId is required" },
      { status: 400 }
    );
  }
  const convSnap = await db
    .collection("conversations")
    .where("tenantId", "==", tenantId)
    .orderBy("createdAt", "desc")
    .get();
  const conversations = convSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  console.log("API: Found conversations:", conversations);
  return NextResponse.json({ conversations });
}

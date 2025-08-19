import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const { conversationId } = await req.json();
  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 }
    );
  }
  const threadsSnap = await db
    .collection("conversations")
    .doc(conversationId)
    .collection("threads")
    .orderBy("createdAt", "asc")
    .get();
  const threads = threadsSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      authorType: data.authorType || "",
      message: data.message || "",
      createdAt: data.createdAt || null,
    };
  });
  return NextResponse.json({ threads });
}

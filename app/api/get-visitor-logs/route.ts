import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await req.json();

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 }
      );
    }

    const visitorLogsRef = db
      .collection("tenants")
      .doc(tenantId)
      .collection("visitorLogs");

    const visitorLogsQuery = visitorLogsRef.orderBy("dateVisited", "desc");
    const visitorLogsSnapshot = await visitorLogsQuery.get();

    const logs = visitorLogsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("API Error in get-visitor-logs:", error);
    return NextResponse.json(
      {
        logs: [],
        error: "Failed to fetch visitor logs. Please try again.",
      },
      { status: 500 }
    );
  }
}

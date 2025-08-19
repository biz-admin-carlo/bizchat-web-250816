import { NextRequest, NextResponse } from "next/server";
import { getCompanyMembers } from "@/app/api/handlers/getCompanyMembers";

export async function POST(req: NextRequest) {
  try {
    const { tenantId } = await req.json();
    if (!tenantId) {
      return NextResponse.json(
        { error: "tenantId is required" },
        { status: 400 }
      );
    }
    const members = await getCompanyMembers(tenantId);
    return NextResponse.json({ members });
  } catch (error) {
    console.error("API Error in get-company-members:", error);
    return NextResponse.json(
      {
        members: [],
        error: "Failed to fetch company members. Please try again.",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { checkUserEmail } from "@/app/api/handlers/checkUserEmail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { exists: false, error: "Email is required" },
        { status: 400 }
      );
    }
    const exists = await checkUserEmail(email);
    return NextResponse.json({ exists });
  } catch (error) {
    console.error("API Error in check-user-email:", error);
    return NextResponse.json(
      {
        exists: false,
        error: "Failed to check email. Please try again.",
      },
      { status: 500 }
    );
  }
}

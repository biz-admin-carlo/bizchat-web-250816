import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const usersRef = db.collection("users");
    const userQuery = usersRef.where("email", "==", email);
    const userSnapshot = await userQuery.get();

    if (userSnapshot.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    return NextResponse.json({
      user: {
        id: userDoc.id,
        ...userData,
      },
    });
  } catch (error) {
    console.error("API Error in get-user-data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch user data. Please try again.",
      },
      { status: 500 }
    );
  }
}

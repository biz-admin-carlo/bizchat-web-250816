import { NextResponse } from "next/server";
import { db } from "@/app/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    console.log("🔍 Listing all users in database...");

    const usersSnapshot = await db.collection("users").get();

    const users = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        createdAt: data.createdAt,
      };
    });

    console.log(`✅ Found ${users.length} users in database`);

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users,
      message: `Found ${users.length} users in database`,
    });
  } catch (error: any) {
    console.error("❌ Error listing users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to list users",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

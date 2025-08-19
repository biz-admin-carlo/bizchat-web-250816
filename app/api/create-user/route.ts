import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/app/api/handlers/createUser";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const result = await createUser(data);
  return NextResponse.json(result);
}

import { NextRequest, NextResponse } from "next/server";
import { createTenant } from "@/app/api/handlers/createTenant";

export async function POST(req: NextRequest) {
  const data = await req.json();
  const result = await createTenant(data);
  return NextResponse.json(result);
}

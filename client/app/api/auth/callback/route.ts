import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (token) {
    // Store token and redirect to dashboard
    const response = NextResponse.redirect(new URL("/", request.url));
    // You can set cookie here if needed
    return response;
  }

  return NextResponse.redirect(new URL("/login", request.url));
}


import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");
  const refreshToken = searchParams.get("refreshToken");

  if (token && refreshToken) {
    // Store tokens in cookies (client-side will also store in localStorage)
    const response = NextResponse.redirect(new URL("/workspace", request.url));
    response.cookies.set("accessToken", token, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.redirect(new URL("/login", request.url));
}


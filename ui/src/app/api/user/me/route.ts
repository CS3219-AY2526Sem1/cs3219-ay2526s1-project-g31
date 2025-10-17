import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  let token = req.headers.get("authorization");

  // 1️⃣ Try to get the refresh token from cookies
  if (!token) {
    const cookieToken = req.cookies.get("refreshToken")?.value;
    if (cookieToken) token = `Bearer ${cookieToken}`;
  }

  // 2️⃣ Try to get user info using access token
  let userServiceRes = await fetch("http://localhost:3001/api/user/me", {
    headers: { Authorization: token || "" },
    credentials: "include",
  });

  // 3️⃣ If token is invalid, try to refresh
  if (userServiceRes.status === 401) {
    console.warn("Access token invalid — attempting refresh...");

    const refreshRes = await fetch("http://localhost:3001/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();

      // Retry the request with new token
      userServiceRes = await fetch("http://localhost:3001/api/user/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } else {
      return NextResponse.json({ error: "Unable to refresh token" }, { status: 401 });
    }
  }

  const data = await userServiceRes.json();
  return NextResponse.json(data, { status: userServiceRes.status });
}

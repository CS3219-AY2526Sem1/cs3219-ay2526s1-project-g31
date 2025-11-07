export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Always include credentials for cookies (refreshToken)
  options.credentials = "include";
  options.headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  // Try initial request
  let res = await fetch(url, options);

  // If unauthorized, attempt token refresh
  if (res.status === 401) {
    console.warn("Access token expired, attempting refresh...");
    const refreshRes = await fetch("http://localhost:3001/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      console.log("Refresh successful, retrying original request...");
      res = await fetch(url, options); // retry original request
    } else {
      console.error("Token refresh failed");
    }
  }

  return res;
}

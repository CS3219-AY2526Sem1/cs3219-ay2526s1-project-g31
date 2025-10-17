export async function getAuthenticatedUser(token: string, userServiceUrl: string) {
    const response = await fetch(`${userServiceUrl}/api/user/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch user details");
    }
    return await response.json();
}
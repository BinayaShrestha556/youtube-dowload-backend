async function refreshAccessToken(refreshToken: string): Promise<string> {
    const clientId = process.env.CLIENT_ID!;
    const clientSecret = process.env.CLIENT_SECRET!;
    const tokenUrl = 'https://accounts.spotify.com/api/token';
  
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });
  
    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
  
      if (!response.ok) {
        throw new Error(`Error refreshing token: ${response.statusText}`);
      }
  
      const data = await response.json();
      const newAccessToken = data.access_token;
  
      // Log the new access token (for demonstration purposes)
      console.log('New Access Token:', newAccessToken);
  
      return newAccessToken; // Return the new access token
    } catch (error) {
      console.error('Error fetching new access token:', error);
      throw error; // Re-throw the error for further handling
    }
  }
  export {refreshAccessToken}
import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

const callback = asyncHandler(async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const clientId = process.env.CLIENT_ID!;
  const clientSecret = process.env.CLIENT_SECRET!;
  const redirectUri = process.env.REDIRECT_URI!;

  const authUrl = "https://accounts.spotify.com/authorize";
  const tokenUrl = "https://accounts.spotify.com/api/token";
  if (!code) {
    res.status(400).send("Authorization code is missing");
    return;
  }

  try {
    // Exchange the authorization code for access and refresh tokens
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    console.log("Access Token:", accessToken);
    console.log("Refresh Token:", refreshToken);

    res.send("Tokens have been logged to the console.");
  } catch (error) {
    console.error("Error fetching tokens:", error);
    res.status(500).send("Error fetching tokens");
  }
});
export { callback };

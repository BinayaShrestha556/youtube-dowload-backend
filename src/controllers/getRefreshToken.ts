import { asyncHandler } from "../utils/asyncHandler";

// Only in Node.js, not needed in the browser
const getAuthentication=asyncHandler(async(req,res)=>{


    const clientId = 'YOUR_CLIENT_ID';
    const clientSecret = 'YOUR_CLIENT_SECRET';
    const redirectUri = 'YOUR_REDIRECT_URI';

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: req.params.authCode,
            redirect_uri: redirectUri,
        }).toString()
    });

    const data = await response.json();
    return data; // Contains access_token, refresh_token, etc.

})
export {getAuthentication}
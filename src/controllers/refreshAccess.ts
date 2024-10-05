import axios from 'axios';
import qs from 'qs'; // To format the request body

import { ApiError } from '../utils/apiError';

const clientId = process.env.CLIENT_ID;
const clientSecret =process.env.CLIENT_SECRET;
const refreshToken =process.env.REFRESH_TOKEN;

const getAccessTokenUsingRefreshToken=async ()=> {
  const url = 'https://accounts.spotify.com/api/token';

  // Encode clientId and clientSecret as Base64
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post(
      url,
      qs.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Response contains the new access token
    console.log('Access Token:', response.data.access_token);
    return response.data.access_token
  } catch (error) {
    console.error('Error fetching access token:', error);
    throw new ApiError(500,"token not generated")
  }
}

// Call the function to fetch a new access token
export {getAccessTokenUsingRefreshToken}
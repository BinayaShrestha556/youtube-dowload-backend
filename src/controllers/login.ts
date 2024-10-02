import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as querystring from 'querystring';
const login=asyncHandler( async (req: Request, res: Response) => {
    const clientId = process.env.CLIENT_ID;

const redirectUri = process.env.REDIRECT_URI;

const authUrl = 'https://accounts.spotify.com/authorize';


    const scope = 'user-read-private user-read-email';
    const state = 'some_random_string'; // Used for security
  
    const queryParams = querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      scope,
      redirect_uri: redirectUri,
      state,
    });
  
    res.redirect(`${authUrl}?${queryParams}`);
  })
  export {login}
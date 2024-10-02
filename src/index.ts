import dotenv from "dotenv"


dotenv.config(); 
import express from "express";

import cors from "cors"

import { login } from "./controllers/login";
import { callback } from "./controllers/callback";
import { getAccessTokenUsingRefreshToken } from "./controllers/refreshAccess";
import {  downloadYouTubeAudio } from "./controllers/downloadMp3FromLink";

import { downloadPlaylist } from "./controllers/downloadFromPlaylists";
const app = express();

app.use(
  cors({
    origin:process.env.CORS==="*"?true:process.env.CORS?.split(","),
    credentials: true,
    exposedHeaders: ['Content-Disposition']
  })
);
app.get('/login',login);

// Step 2: Handle Spotify callback and exchange authorization code for tokens
app.get('/callback',callback );
app.post('/refresh-access',getAccessTokenUsingRefreshToken)
app.get("/download/youtube/playlist/:playlistId",downloadPlaylist)
app.get("/download/youtube/video/:id",downloadYouTubeAudio)

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.listen(process.env.PORT||8000,()=>console.log("server is running on port: ",process.env.PORT||8000))


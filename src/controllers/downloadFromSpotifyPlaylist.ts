import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler";
import { getAccessTokenUsingRefreshToken } from "./refreshAccess";
import path from "path";
import youtubeDl from "youtube-dl-exec";
import fs from "fs"
import AdmZip from "adm-zip";

const downloadFromSpotifyPlaylist = asyncHandler(async (req, res) => {
  const playlistId = req.params.playlistId;
  
    // const accessToken = await getAccessToken();
    const playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}`;
    let songs
    let playlistName

    try {
        const response = await axios.get(playlistUrl, {
          headers: {
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
          }
        });
        songs=response.data.tracks.items
        playlistName=response.data.name
        
      } catch (error:any) {
        if (error.response.status === 401 && error.response.data.error.message === "The access token expired") {
          console.log("Access token expired, fetching a new one...");
          process.env.ACCESS_TOKEN = await getAccessTokenUsingRefreshToken();
          
          // Retry the request with the new token
          const response = await axios.get(playlistUrl, {
            headers: {
              'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
            }
          });
          songs=response.data.tracks.items
          playlistName=response.data.name
        } else {
          console.error(error);
        }
      }
      songs=songs.map((i:any)=>({name:i.track.name,artist:i.track.artists[0].name}))

      
      await Promise.all(songs.map(async(i:any)=>{
        try {
            const downloadDir = path.join(__dirname, 'download');
            if (!fs.existsSync(downloadDir)) {
              fs.mkdirSync(downloadDir);}
              const outputPath = path.join(downloadDir, `${i.name}.mp3`);
            // Search for video by title and download the audio
            await youtubeDl(`ytsearch1:"${i.name}"`, {
              extractAudio: true,
              audioFormat: 'mp3',
              output: outputPath,
             // This limits the search to the top result
              noCheckCertificates: true, // Avoid SSL certificate issues
              preferFreeFormats: true, // Prefer free formats if available
            });
        
            console.log(`Audio downloaded successfully: ${outputPath}`);
          } catch (error) {
            console.error('Error downloading audio:', error);
          }
      }))
      const zip = new AdmZip();
      const downloadDir = path.join(__dirname, 'download');
    fs.readdirSync(downloadDir).forEach(file => {
      const filePath = path.join(downloadDir, file);
      zip.addLocalFile(filePath);
    });

    // Sanitize the playlist title for a valid filename
    const sanitizedTitle=playlistName?playlistName:"download"

    const zipFilePath = path.join(__dirname, `../downloads/${sanitizedTitle}.zip`);
    zip.writeZip(zipFilePath);

    // Step 4: Send the zip file as a response
    return res.download(zipFilePath, `${sanitizedTitle}.zip`, (err) => {
      if (err) {
        console.error('Error sending the zip file:', err);
        res.status(500).send('Error downloading the file');
      }

      // Cleanup: Remove the zip and downloaded files after sending the response
      fs.rmSync(downloadDir, { recursive: true, force: true });
      fs.unlinkSync(zipFilePath);
    });
   
    
  
});
export {downloadFromSpotifyPlaylist}

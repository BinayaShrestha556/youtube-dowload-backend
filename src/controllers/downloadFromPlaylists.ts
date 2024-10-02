import { google} from 'googleapis';
import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

// YouTube Data API setup
const youtube = google.youtube('v3');

// Fetch playlist title and items from YouTube
async function getPlaylistDetails(playlistId: string, apiKey: string): Promise<{ title: string; videos: { title: string; videoId: string }[] }> {
  // Fetch playlist title
  const playlistResponse = await youtube.playlists.list({
    part: ['snippet'],
    id: [playlistId],
    key: apiKey
  });

  const playlistTitle = playlistResponse.data.items?.[0]?.snippet?.title || 'Unknown Playlist';

  // Fetch playlist videos
  const videoResponse = await youtube.playlistItems.list({
    part: ['snippet'],
    playlistId: playlistId,
    maxResults: 50,
    key: apiKey
  });

  const videos = videoResponse.data.items?.map(item => ({
    title: item.snippet?.title ?? 'Unknown Title',
    videoId: item.snippet?.resourceId?.videoId ?? ''
  })) || [];

  return { title: playlistTitle, videos };
}

// Download MP3 using youtube-dl-exec
async function downloadMP3(videoId: string, outputDir: string): Promise<string> {
  const outputFile = path.join(outputDir, `${videoId}.mp3`);
  await youtubedl(`https://www.youtube.com/watch?v=${videoId}`, {
    output: outputFile,
    extractAudio: true,
    audioFormat: 'mp3',
  });
  return outputFile;
}

// Controller function to handle playlist download
export async function downloadPlaylist(req: Request, res: Response): Promise<void> {
  const playlistId = req.params.playlistId;
  const apiKey = process.env.YOUTUBE_API;
  if (!apiKey) {
    res.status(500).send('API Key not configured');
    return;
  }

  const outputDir = path.join(__dirname, `../downloads/${uuidv4()}`);

  try {
    // Step 1: Fetch playlist details (title + videos)
    const { title: playlistTitle, videos } = await getPlaylistDetails(playlistId, apiKey);

    // Create a unique folder for this request
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Step 2: Download MP3s for each video
    const downloadPromises = videos.map(video => downloadMP3(video.videoId, outputDir));
    await Promise.all(downloadPromises);

    // Step 3: Zip the downloaded MP3s
    const zip = new AdmZip();
    fs.readdirSync(outputDir).forEach(file => {
      const filePath = path.join(outputDir, file);
      zip.addLocalFile(filePath);
    });

    // Sanitize the playlist title for a valid filename
    const sanitizedTitle = playlistTitle.replace(/[<>:"/\\|?*]+/g, '');

    const zipFilePath = path.join(__dirname, `../downloads/${sanitizedTitle}.zip`);
    zip.writeZip(zipFilePath);

    // Step 4: Send the zip file as a response
    res.download(zipFilePath, `${sanitizedTitle}.zip`, (err) => {
      if (err) {
        console.error('Error sending the zip file:', err);
        res.status(500).send('Error downloading the file');
      }

      // Cleanup: Remove the zip and downloaded files after sending the response
      fs.rmSync(outputDir, { recursive: true, force: true });
      fs.unlinkSync(zipFilePath);
    });
  } catch (error) {
    console.error('Error processing the request:', error);
    res.status(500).send('An error occurred');
  }
}

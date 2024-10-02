

import fs from 'fs';
import path from 'path';
import { asyncHandler } from "../utils/asyncHandler";
import youtubeDl from 'youtube-dl-exec';
interface VideoMetadata {
    title: string;
    // You can add more properties if needed based on what `youtube-dl-exec` returns
}

const downloadYouTubeAudio = asyncHandler (async (req, res) => {
  const  id= req.params.id; 
  const videoUrl="https://youtube.com/watch?v="+id// Get the YouTube URL from the query parameter
  const downloadPath = path.join(__dirname, 'downloads'); // Directory to save the downloaded file
  
  // Ensure the download directory exists
  if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath);
  }

  try {
    const metadata = await youtubeDl(videoUrl, {
        dumpSingleJson: true, // Extract metadata as JSON
    }) as VideoMetadata; // Explicitly type the metadata as an object with title

    

    const title = metadata.title; // Get the video title from metadata
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_'); // Sanitize title to use as filename
    const fileName = `${sanitizedTitle}.mp3`;
      // Use youtube-dl-exec to download the video/audio
      const output = await youtubeDl(videoUrl, {
          extractAudio: true,
          audioFormat: 'mp3',
          output: path.join(downloadPath, '%(title)s.%(ext)s'), // Save the file in the "downloads" folder
      });

      console.log('Download complete:', output);
      
      // Find the downloaded file (assuming only one file downloaded in the folder)
      const downloadedFile = fs.readdirSync(downloadPath).find(file => file.endsWith('.mp3'));

      if (downloadedFile) {
          const filePath = path.join(downloadPath, downloadedFile);

          // Serve the file as a downloadable resource
          console.log("**************************************************************",fileName)
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`); 
          res.download(filePath,fileName, err => {
              if (err) {
                  res.status(500).send('Error downloading the file.');
              } else {
                  // Optionally, delete the file after download to free space
                  fs.unlinkSync(filePath);
              }
          });
      } else {
          res.status(404).send('File not found.');
      }
  } catch (error) {
      console.error('Error downloading:', error);
      res.status(500).send('Error downloading the video.');
  }
})
  export {downloadYouTubeAudio}
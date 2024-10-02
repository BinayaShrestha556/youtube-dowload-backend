import { exec } from 'child_process';

const getYouTubeVideoIdFromTitle = (songTitle: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        const command = `yt-dlp "ytsearch:${songTitle}" --get-id --no-warnings --max-results 1`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing yt-dlp: ${stderr}`);
                reject(error);
            } else {
                const videoId = stdout.trim();
                if (videoId) {
                    resolve(videoId);
                } else {
                    resolve(null);
                }
            }
        });
    });
};

// Example usage
const songTitle = 'Shape of You Ed Sheeran';

getYouTubeVideoIdFromTitle(songTitle)
    .then((videoId) => {
        if (videoId) {
            console.log(`Found video ID: ${videoId}`);
        } else {
            console.log('No video found.');
        }
    })
    .catch((err) => console.error('Error:', err));
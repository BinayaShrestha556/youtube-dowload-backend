const youtubedl = require('youtube-dl-exec');
const path = require('path');
const { default: axios } = require('axios');

const downloadAudioFromYouTube = async (title) => {
  try {
    const playlistUrl = `https://api.spotify.com/v1/playlists/${title}`;
    

    
        const response = await axios.get(playlistUrl, {
          headers: {
            'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
          }
        });
        console.log(response.data)
  } catch (error) {
    console.error('Error downloading audio:', error);
  }
};

// Example usage
downloadAudioFromYouTube('6YkQfIbP6WGwv04XuzbnEM');
import youtubeDl from "youtube-dl-exec";


youtubeDl('https://www.youtube.com/watch?v=4QIZE708gJ4', {
    extractAudio: true,
    audioFormat: 'mp3',
    output: '%(title)s.%(ext)s'
}).then(output => {
    console.log(output);
}).catch(error => {
    console.error(error);
});
const { exec } = require("child_process");
const fs = require('fs');

const trackDir = process.argv[3] || __dirname;
const command = (fileName) => `ffmpeg -i "${fileName}.mp4" -q:a 0 -map a "mp3\\${fileName}.mp3"`;

const collectTracks = new Promise((resolve, reject) => {
  fs.readdir(trackDir, (err, files) => {
    if(err) { reject(err); return; }
    const tracks = files.filter(fileName =>
      // Collect all files with mp4 ext
      /.*\.mp4$/.test(fileName))
      // Collect the name without ext
      .map(fileName => fileName.match(/(.*)\.mp4$/)[1]);
    resolve(tracks);
  });
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
          reject(error);
      }
      if (stderr) {
          reject(stderr);
      }
      resolve(stdout);
    });
  });
};

async function extractAudio() {
  const tracks = await collectTracks;
  const commands = tracks.map(fileName => command(fileName));
  await Promise.all(commands.map(command => execCommand(command)));
}

extractAudio();

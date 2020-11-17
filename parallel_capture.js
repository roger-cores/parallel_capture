const { exec } = require("child_process");
const fs = require('fs');

const trackDir = process.argv[3] || __dirname;
const trackNumber = process.argv[2] || 0;

const collectTracks = new Promise((resolve, reject) => {
  fs.readdir(trackDir, (err, files) => {
    if(err) { reject(err); return; }
    const tracks = files.filter(fileName => /.*\.mp4$/.test(fileName));
    resolve(tracks);
  });
});

const saveFile = (captureName, trackNumber) => new Promise((resolve) => {
  exec(`move /y out\\${captureName} capture-${trackNumber}.mp4`, (error, stdout, stderr) => {
    if (error) {
      console.log(`here and now error: ${error.message}`);
    } else if (stderr) {
      console.log(`here and now stderr: ${stderr}`);
    } else {
      console.log(`here and now stdout: ${stdout}`);
    }
    resolve();
  });
});

const delay = (duration) => new Promise((resolve) => {
  setTimeout(function() {
    resolve();
  }, duration);
});

async function executeParallelCapture() {
  const tracks = await collectTracks;
  console.log('playing tracks: ', tracks);
  for(let trackUrl of tracks) {
    exec(`ffplay -nodisp ${trackUrl}`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
  }
  const microphone = "Microphone (AT2020USB+)";
  const captureName = `capture-${Date.now()}.mp4`;
  const captureCommand =
  `ffmpeg -f dshow -video_size 1280x720 -framerate 30 -t 75 \
  -i video="Surface Camera Front":audio="${microphone}" out/${captureName}`;

  exec(captureCommand, (error, stdout, stderr) => {
    if (error) {
        console.log(`here and now error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`here and now stderr: ${stderr}`);
        return;
    }
    console.log(`here and now stdout: ${stdout}`);
  });

  await delay(78000);
  await saveFile(captureName, trackNumber);
}

executeParallelCapture();

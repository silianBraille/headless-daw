
const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const soundClips = document.querySelector('#track_list');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.main-controls');

let synth = document.querySelector('.tinysynth');
let context = synth.getAudioContext();
let speaker = context.destination;
let gain = context.createGain();
synth.setAudioContext(context, gain);
let dest = context.createMediaStreamDestination();
gain.connect(dest);
gain.connect(speaker);

// disable stop button while not recording

stop.disabled = true;

// visualiser setup - create web audio api context and canvas

let audioCtx;
const canvasCtx = canvas.getContext("2d");

//main block for doing the audio recording

if (navigator.mediaDevices.getUserMedia) {
  console.log('getUserMedia supported.');

  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    //setting up recorder to record streams from both microphone and instruments
	const audioMixer = new MultiStreamsMixer([stream, dest.stream]);
    let mixedstream = audioMixer.getMixedStream();
    visualize(mixedstream);

	const mediaRecorder = useMic ? new MediaRecorder(mixedstream) : new MediaRecorder(dest.stream);

    record.onclick = function() {
      mediaRecorder.start();
      console.log(mediaRecorder.state);
      console.log("recorder started");
      record.style.background = "red";

      stop.disabled = false;
      record.disabled = true;
    }

    stop.onclick = function() {
      mediaRecorder.stop();
      console.log(mediaRecorder.state);
      console.log("recorder stopped");
      record.style.background = "";
      record.style.color = "";
      // mediaRecorder.requestData();

      stop.disabled = true;
      record.disabled = false;
    }

    mediaRecorder.onstop = function() {
      console.log("data available after MediaRecorder.stop() called.");

      const clipName = prompt('Enter a name for your sound clip?','My unnamed clip');

      const clipContainer = document.createElement('tr');
      const clipLabel = document.createElement('p');
      const audio = document.createElement('audio');
      const deleteButton = document.createElement('button');

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'delete';

      if(clipName === null) {
        clipLabel.textContent = 'My unnamed clip';
      } else {
        clipLabel.textContent = clipName;
      }

      clipContainer.appendChild(document.createElement('td')).appendChild(audio);
      clipContainer.appendChild(document.createElement('td')).appendChild(clipLabel);
      clipContainer.appendChild(document.createElement('td')).appendChild(deleteButton);
      soundClips.appendChild(clipContainer);

      audio.controls = true;
      const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
      chunks = [];
      const audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;
      console.log("recorder stopped");

      deleteButton.onclick = function(e) {
        let evtTgt = e.target;
		let trackIndex = curTrackIndex;
		for (let i=0; i < evtTgt.parentNode.parentNode.parentNode.children.length; i++) {
			if(evtTgt.parentNode.parentNode.parentNode.children[i] == evtTgt.parentNode.parentNode) {
				let trackIndex = i;
				break;
			}
		}
		delTrack(trackIndex);
        evtTgt.parentNode.parentNode.parentNode.removeChild(evtTgt.parentNode.parentNode);
      }

      clipLabel.onclick = function() {
        const existingName = clipLabel.textContent;
        const newClipName = prompt('Enter a new name for your sound clip?');
        if(newClipName === null) {
          clipLabel.textContent = existingName;
        } else {
          clipLabel.textContent = newClipName;
        }
      }
    }

    mediaRecorder.ondataavailable = function(e) {
      chunks.push(e.data);
    }
  }

  let onError = function(err) {
    console.log('The following error occured: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia not supported on your browser!');
}

function visualize(stream) {
  if(!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    WIDTH = canvas.width
    HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for(let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();

  }
}

window.onresize = function() {
  canvas.width = mainSection.offsetWidth;
}

window.onresize();

// var context = new window.webkitAudioContext();
// var source = null;
// var audioBuffer = null;

// function stopSound() {
//   if (source) {
//     source.noteOff(0);
//   }
// }

// function playSound() {
//   // source is global so we can call .noteOff() later.
//   source = context.createBufferSource();
//   source.buffer = audioBuffer;
//   source.loop = false;
//   source.connect(context.destination);
//   source.noteOn(0); // Play immediately.
// }

// function initSound(arrayBuffer) {
//   context.decodeAudioData(arrayBuffer, function(buffer) {
//     // audioBuffer is global to reuse the decoded audio later.
//     audioBuffer = buffer;
//     var buttons = document.querySelectorAll('button');
//     buttons[0].disabled = false;
//     buttons[1].disabled = false;
//   }, function(e) {
//     console.log('Error decoding file', e);
//   }); 
// }

// // User selects file, read it as an ArrayBuffer and pass to the API.
// var fileInput = document.querySelector('input[type="file"]');
// fileInput.addEventListener('change', function(e) {  
//   var reader = new FileReader();
//   reader.onload = function(e) {
//     initSound(this.result);
//   };
//   reader.readAsArrayBuffer(this.files[0]);
// }, false);

// // Load file from a URL as an ArrayBuffer.
// // Example: loading via xhr2: loadSoundFile('sounds/test.mp3');
// function loadSoundFile(url) {
//   var xhr = new XMLHttpRequest();
//   xhr.open('GET', url, true);
//   xhr.responseType = 'arraybuffer';
//   xhr.onload = function(e) {
//     initSound(this.response); // this.response is an ArrayBuffer.
//   };
//   xhr.send();
// }

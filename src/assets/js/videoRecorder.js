/* eslint-disable no-use-before-define */
const recorderContainer = document.getElementById("jsRecordContainer");
const recordBtn = document.getElementById("jsRecordBtn");
const videoPreview = document.getElementById("jsVideoPreview");

let stream = null;
let streamObject;
let videoRecorder;

const handleVideoData = event => {
  const { data: videoFile } = event;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(videoFile);
  link.download = "recorded.mp4";
  document.body.appendChild(link);
  link.click();
};

const stopRecording = () => {
  videoRecorder.stop();
  recordBtn.removeEventListener("click", stopRecording);
  recordBtn.addEventListener("click", getVideo);
  recordBtn.innerHTML = "Start recording";
  stream.getTracks().forEach(function(track) {
    track.stop();
  });
};

const startRecording = () => {
  videoRecorder = new MediaRecorder(streamObject);
  videoRecorder.start();
  recordBtn.innerHTML = "Stop recording";
  videoRecorder.addEventListener("dataavailable", handleVideoData); // data가 available하면 함수실행
  recordBtn.addEventListener("click", stopRecording);
};

const getVideo = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { width: 640, height: 480 }
    });
    videoPreview.srcObject = stream;
    videoPreview.muted = true;
    videoPreview.play();
    recordBtn.innerHTML = "Stop recording";
    streamObject = stream;
    startRecording();
  } catch (error) {
    recordBtn.innerHTML = "😥 Can't record";
  } finally {
    recordBtn.removeEventListener("click", getVideo);
  }
};

function init() {
  recordBtn.addEventListener("click", getVideo);
}

if (recorderContainer) {
  init();
}

const video = document.createElement("video");
video.autoplay = true;
video.playsInline = true;

document.body.appendChild(video);

// Ask for camera access
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  })
  .catch(err => {
    alert("Camera access denied");
  });

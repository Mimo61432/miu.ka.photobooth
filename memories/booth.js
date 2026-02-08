const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const countdownEl = document.getElementById("countdown");
const stripCanvas = document.getElementById("strip");
const stripCtx = stripCanvas.getContext("2d");

// Camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream);

// Start booth
startBtn.onclick = async () => {
  stripCtx.clearRect(0, 0, stripCanvas.width, stripCanvas.height);

  for (let i = 0; i < 4; i++) {
    await countdown();
    capture(i);
  }
};

function countdown() {
  return new Promise(resolve => {
    let t = 3;
    countdownEl.textContent = t;
    const i = setInterval(() => {
      t--;
      if (t === 0) {
        clearInterval(i);
        countdownEl.textContent = "";
        resolve();
      } else {
        countdownEl.textContent = t;
      }
    }, 1000);
  });
}

function capture(i) {
  const temp = document.createElement("canvas");
  temp.width = video.videoWidth;
  temp.height = video.videoHeight;
  temp.getContext("2d").drawImage(video, 0, 0);

  stripCtx.drawImage(
    temp,
    0,
    i * 300,
    stripCanvas.width,
    300
  );
}

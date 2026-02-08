const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const countdownEl = document.getElementById("countdown");
const stripCanvas = document.getElementById("strip");
const stripCtx = stripCanvas.getContext("2d");

let stream;

// 1️⃣ Start camera
navigator.mediaDevices.getUserMedia({ video: true })
  .then(s => {
    stream = s;
    video.srcObject = stream;
  })
  .catch(() => alert("Camera access denied"));

// 2️⃣ Start photobooth
startBtn.onclick = async () => {
  startBtn.disabled = true;
  stripCtx.clearRect(0, 0, stripCanvas.width, stripCanvas.height);

  for (let i = 0; i < 4; i++) {
    await countdown();
    capturePhoto(i);
  }

  countdownEl.textContent = "📸 Done!";
  startBtn.disabled = false;
};

// 3️⃣ Countdown function
function countdown() {
  return new Promise(resolve => {
    let time = 3;
    countdownEl.textContent = time;

    const interval = setInterval(() => {
      time--;
      if (time === 0) {
        clearInterval(interval);
        countdownEl.textContent = "";
        resolve();
      } else {
        countdownEl.textContent = time;
      }
    }, 1000);
  });
}

// 4️⃣ Capture photo into strip
function capturePhoto(index) {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;
  const tempCtx = tempCanvas.getContext("2d");

  tempCtx.drawImage(video, 0, 0);

  stripCtx.drawImage(
    tempCanvas,
    0,
    index * 300,
    stripCanvas.width,
    300
  );
}

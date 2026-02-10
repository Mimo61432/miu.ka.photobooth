// =======================
// BASIC SETUP
// =======================
const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const countdownEl = document.getElementById("countdown");
const stripCanvas = document.getElementById("strip");
const stripCtx = stripCanvas.getContext("2d");

// =======================
// GLOBAL STATE
// =======================
let photos = [];
let frameColor = "#fffd74"; // butter yellow default

let placedStickers = [];
let draggingSticker = null;
let offsetX = 0;
let offsetY = 0;

// =======================
// CAMERA ACCESS
// =======================
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then(stream => {
    video.srcObject = stream;
  });

// =======================
// START PHOTOBOOTH
// =======================
startBtn.onclick = async () => {
  photos = [];
  placedStickers = [];

  stripCtx.clearRect(0, 0, stripCanvas.width, stripCanvas.height);

  for (let i = 0; i < 4; i++) {
    await countdown();
    capture(i);
  }
};

// =======================
// COUNTDOWN
// =======================
function countdown() {
  return new Promise(resolve => {
    let t = 3;
    countdownEl.textContent = t;

    const timer = setInterval(() => {
      t--;
      if (t === 0) {
        clearInterval(timer);
        countdownEl.textContent = "";
        resolve();
      } else {
        countdownEl.textContent = t;
      }
    }, 1000);
  });
}

// =======================
// CAPTURE PHOTO
// =======================
function capture(i) {
  const temp = document.createElement("canvas");
  temp.width = video.videoWidth;
  temp.height = video.videoHeight;

  const ctx = temp.getContext("2d");
  ctx.drawImage(video, 0, 0);

  photos[i] = temp;
  redrawStrip();
}

// =======================
// REDRAW EVERYTHING
// =======================
function redrawStrip() {
  // frame background
  stripCtx.fillStyle = frameColor;
  stripCtx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

  // photos
  photos.forEach((p, i) => {
    stripCtx.drawImage(
      p,
      0,
      i * 300,
      stripCanvas.width,
      300
    );
  });

  // stickers
  placedStickers.forEach(s => {
    stripCtx.drawImage(
      s.img,
      s.x,
      s.y,
      s.size,
      s.size
    );
  });
}

// =======================
// STICKERS
// =======================
const stickerFiles = [
  "bear.png",
  "bunny.png",
  "heart.png",
  "kiss.png",
  "flower.png",
  "drink.png"
];

const stickerBox = document.getElementById("stickers");

stickerFiles.forEach(file => {
  const img = document.createElement("img");
  img.src = "stickers/" + file;
  img.className = "sticker";

  img.onclick = () => addSticker(img.src);
  stickerBox.appendChild(img);
});

function addSticker(src) {
  const img = new Image();
  img.src = src;

  img.onload = () => {
    placedStickers.push({
      img,
      x: 100,
      y: 100,
      size: 80
    });
    redrawStrip();
  };
}

// =======================
// DRAG STICKERS (MOUSE)
// =======================
stripCanvas.addEventListener("mousedown", e => {
  const rect = stripCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  for (let i = placedStickers.length - 1; i >= 0; i--) {
    const s = placedStickers[i];
    if (
      x >= s.x &&
      x <= s.x + s.size &&
      y >= s.y &&
      y <= s.y + s.size
    ) {
      draggingSticker = s;
      offsetX = x - s.x;
      offsetY = y - s.y;
      break;
    }
  }
});

stripCanvas.addEventListener("mousemove", e => {
  if (!draggingSticker) return;

  const rect = stripCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  draggingSticker.x = x - offsetX;
  draggingSticker.y = y - offsetY;
  redrawStrip();
});

stripCanvas.addEventListener("mouseup", () => {
  draggingSticker = null;
});

// =======================
// TOUCH SUPPORT (MOBILE)
// =======================
stripCanvas.addEventListener("touchstart", e => {
  const rect = stripCanvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  for (let i = placedStickers.length - 1; i >= 0; i--) {
    const s = placedStickers[i];
    if (
      x >= s.x &&
      x <= s.x + s.size &&
      y >= s.y &&
      y <= s.y + s.size
    ) {
      draggingSticker = s;
      offsetX = x - s.x;
      offsetY = y - s.y;
      break;
    }
  }
});

stripCanvas.addEventListener("touchmove", e => {
  if (!draggingSticker) return;

  const rect = stripCanvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  draggingSticker.x = x - offsetX;
  draggingSticker.y = y - offsetY;
  redrawStrip();
});

stripCanvas.addEventListener("touchend", () => {
  draggingSticker = null;
});

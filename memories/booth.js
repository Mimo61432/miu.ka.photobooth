// =======================
// ELEMENTS
// =======================
const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const countdownEl = document.getElementById("countdown");
const stripCanvas = document.getElementById("strip");
const stripCtx = stripCanvas.getContext("2d");
const colorBox = document.getElementById("colors");
const stickerBox = document.getElementById("stickers");

// =======================
// CONFIG
// =======================
const PHOTO_WIDTH = 260;
const PHOTO_HEIGHT = 260;
const PHOTO_PADDING = 20;
const CORNER_RADIUS = 22;

// =======================
// STATE
// =======================
let photos = [];
let frameColor = "#fffd74";
let stickers = [];
let dragging = null;
let offsetX = 0;
let offsetY = 0;

// =======================
// CAMERA
// =======================
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

// =======================
// START
// =======================
startBtn.onclick = async () => {
  photos = [];
  stickers = [];
  redraw();

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
// CAPTURE
// =======================
function capture(i) {
  const temp = document.createElement("canvas");
  temp.width = video.videoWidth;
  temp.height = video.videoHeight;
  temp.getContext("2d").drawImage(video, 0, 0);
  photos[i] = temp;
  redraw();
}

// =======================
// ROUNDED IMAGE
// =======================
function drawRounded(ctx, img, x, y, w, h, r) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

// =======================
// REDRAW
// =======================
function redraw() {
  stripCtx.fillStyle = frameColor;
  stripCtx.fillRect(0, 0, stripCanvas.width, stripCanvas.height);

  photos.forEach((p, i) => {
    const x = (stripCanvas.width - PHOTO_WIDTH) / 2;
    const y = i * (PHOTO_HEIGHT + PHOTO_PADDING * 2) + PHOTO_PADDING;

    drawRounded(
      stripCtx,
      p,
      x,
      y,
      PHOTO_WIDTH,
      PHOTO_HEIGHT,
      CORNER_RADIUS
    );
  });

  stickers.forEach(s => {
    stripCtx.drawImage(s.img, s.x, s.y, s.size, s.size);
  });
}

// =======================
// FRAME COLORS
// =======================
[
  "#B0E0E6", "#77DD77", "#fffd74", "#F5F5DC",
  "#D2042D", "#800000", "#964B00", "#C27E79",
  "#F4C2C2", "#E6E6FA", "#FFE5B4", "#000000"
].forEach(c => {
  const d = document.createElement("div");
  d.style.background = c;
  d.style.width = "30px";
  d.style.height = "30px";
  d.style.borderRadius = "50%";
  d.style.cursor = "pointer";
  d.onclick = () => {
    frameColor = c;
    redraw();
  };
  colorBox.appendChild(d);
});

// =======================
// STICKERS
// =======================
["bear.png","bunny.png","heart.png","kiss.png"].forEach(file => {
  const img = document.createElement("img");
  img.src = "stickers/" + file;
  img.className = "sticker";
  img.onclick = () => placeSticker(img.src);
  stickerBox.appendChild(img);
});

function placeSticker(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    stickers.push({ img, x: 120, y: 120, size: 80 });
    redraw();
  };
}

// =======================
// DRAG STICKERS
// =======================
stripCanvas.addEventListener("mousedown", e => {
  const r = stripCanvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;

  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (x >= s.x && x <= s.x + s.size && y >= s.y && y <= s.y + s.size) {
      dragging = s;
      offsetX = x - s.x;
      offsetY = y - s.y;
      break;
    }
  }
});

stripCanvas.addEventListener("mousemove", e => {
  if (!dragging) return;
  const r = stripCanvas.getBoundingClientRect();
  dragging.x = e.clientX - r.left - offsetX;
  dragging.y = e.clientY - r.top - offsetY;
  redraw();
});

stripCanvas.addEventListener("mouseup", () => dragging = null);

const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const countdownEl = document.getElementById("countdown");
const canvas = document.getElementById("strip");
const ctx = canvas.getContext("2d");
const stickersDiv = document.getElementById("stickers");
const downloadBtn = document.getElementById("downloadBtn");
const frameColorInput = document.getElementById("frameColor");

// mirror preview
video.style.transform = "scaleX(-1)";

// camera
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
});

// stickers (CASE SENSITIVE)
const STICKERS = [
  "awesomekitty.PNG",
  "brownteddy.PNG",
  "cherries.PNG",
  "flowerenvelope.PNG",
  "headphone.PNG",
  "huggingkitty.PNG",
  "kittywithtears.PNG",
  "matcha.PNG",
  "pinkteddy.PNG",
  "pinkteddywithcross.PNG",
  "redjasmine.PNG",
  "redmushroom.PNG",
  "strawberry.PNG",
  "tulip.PNG",
  "whitebunny.PNG",
  "yellowjasmine.PNG"
];

let photoStrip = [];
let placedStickers = [];
let activeSticker = null;
let hoverSticker = null;
let offsetX = 0;
let offsetY = 0;
let frameColor = frameColorInput.value;

// build sticker tray
STICKERS.forEach(name => {
  const img = document.createElement("img");
  img.src = "stickers/" + name;
  img.className = "sticker-thumb";
  img.onclick = () => addSticker(img.src);
  stickersDiv.appendChild(img);
});

frameColorInput.oninput = e => {
  frameColor = e.target.value;
  redraw();
};

function addSticker(src) {
  const img = new Image();
  img.src = src;
  placedStickers.push({ img, x: 140, y: 220, size: 80 });
  redraw();
}

// start photobooth
startBtn.onclick = async () => {
  photoStrip = [];

  for (let i = 0; i < 2; i++) {
    await countdown();
    const temp = document.createElement("canvas");
    temp.width = 260;
    temp.height = 200;
    const tctx = temp.getContext("2d");

    tctx.save();
    tctx.scale(-1, 1);
    tctx.drawImage(video, -260, 0, 260, 200);
    tctx.restore();

    photoStrip.push(temp);
  }

  redraw();
};

function countdown() {
  return new Promise(resolve => {
    let t = 3;
    countdownEl.textContent = t;
    const i = setInterval(() => {
      t--;
      countdownEl.textContent = t;
      if (t === 0) {
        clearInterval(i);
        countdownEl.textContent = "";
        resolve();
      }
    }, 1000);
  });
}

// draw rounded photo
function drawRoundedImage(img, x, y, w, h, r) {
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
}

// redraw everything
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let y = 20;
  photoStrip.forEach(photo => {
    ctx.fillStyle = frameColor;
    ctx.fillRect(40, y - 6, 280, 212);

    ctx.save();
    drawRoundedImage(photo, 50, y, 260, 200, 20);
    ctx.restore();

    y += 240;
  });

  placedStickers.forEach(s => {
    ctx.drawImage(s.img, s.x, s.y, s.size, s.size);
  });
}

// helpers
function getStickerAt(x, y) {
  for (let i = placedStickers.length - 1; i >= 0; i--) {
    const s = placedStickers[i];
    if (x > s.x && x < s.x + s.size && y > s.y && y < s.y + s.size) {
      return s;
    }
  }
  return null;
}

// drag
canvas.addEventListener("mousedown", e => {
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  const s = getStickerAt(x, y);
  if (s) {
    activeSticker = s;
    offsetX = x - s.x;
    offsetY = y - s.y;
  }
});

canvas.addEventListener("mousemove", e => {
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  hoverSticker = getStickerAt(x, y);
  if (activeSticker) {
    activeSticker.x = x - offsetX;
    activeSticker.y = y - offsetY;
    redraw();
  }
});

canvas.addEventListener("mouseup", () => activeSticker = null);

// resize
canvas.addEventListener("wheel", e => {
  if (!hoverSticker) return;
  e.preventDefault();
  hoverSticker.size += e.deltaY < 0 ? 10 : -10;
  hoverSticker.size = Math.max(40, Math.min(200, hoverSticker.size));
  redraw();
});

// download
downloadBtn.onclick = () => {
  const a = document.createElement("a");
  a.download = "our_photobooth.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
};

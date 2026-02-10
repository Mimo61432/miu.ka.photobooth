const video = document.getElementById("video");
const startBtn = document.getElementById("startBtn");
const countdownEl = document.getElementById("countdown");
const canvas = document.getElementById("strip");
const ctx = canvas.getContext("2d");
const stickersDiv = document.getElementById("stickers");
const downloadBtn = document.getElementById("downloadBtn");

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

let photoStrip = null;
let placedStickers = [];
let activeSticker = null;
let hoverSticker = null;
let offsetX = 0;
let offsetY = 0;

// build sticker tray
STICKERS.forEach(name => {
  const img = document.createElement("img");
  img.src = "stickers/" + name;
  img.className = "sticker-thumb";
  img.onclick = () => addSticker(img.src);
  stickersDiv.appendChild(img);
});

function addSticker(src) {
  const img = new Image();
  img.src = src;
  placedStickers.push({
    img,
    x: 150,
    y: 150,
    size: 100
  });
  redraw();
}

// capture photos
startBtn.onclick = async () => {
  photoStrip = document.createElement("canvas");
  photoStrip.width = 400;
  photoStrip.height = 1200;
  const pctx = photoStrip.getContext("2d");

  for (let i = 0; i < 4; i++) {
    await countdown();
    pctx.save();
    pctx.scale(-1, 1);
    pctx.drawImage(video, -400, i * 300, 400, 300);
    pctx.restore();
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

// redraw
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (photoStrip) ctx.drawImage(photoStrip, 0, 0);
  placedStickers.forEach(s => {
    ctx.drawImage(s.img, s.x, s.y, s.size, s.size);
  });
}

// detect sticker under mouse
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
canvas.addEventListener("mouseleave", () => activeSticker = null);

// resize with scroll
canvas.addEventListener("wheel", e => {
  if (!hoverSticker) return;
  e.preventDefault();

  hoverSticker.size += e.deltaY < 0 ? 10 : -10;
  hoverSticker.size = Math.max(40, Math.min(300, hoverSticker.size));
  redraw();
});

// download
downloadBtn.onclick = () => {
  const a = document.createElement("a");
  a.download = "our_photobooth.png";
  a.href = canvas.toDataURL();
  a.click();
};

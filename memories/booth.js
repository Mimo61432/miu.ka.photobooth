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

// sticker files (CASE SENSITIVE)
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
  const sticker = {
    img,
    x: 150,
    y: 150,
    size: 100
  };
  placedStickers.push(sticker);
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

// redraw canvas
function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (photoStrip) ctx.drawImage(photoStrip, 0, 0);
  placedStickers.forEach(s => {
    ctx.drawImage(s.img, s.x, s.y, s.size, s.size);
  });
}

// mouse drag logic
canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  for (let i = placedStickers.length - 1; i >= 0; i--) {
    const s = placedStickers[i];
    if (
      mx > s.x &&
      mx < s.x + s.size &&
      my > s.y &&
      my < s.y + s.size
    ) {
      activeSticker = s;
      offsetX = mx - s.x;
      offsetY = my - s.y;
      return;
    }
  }
});

canvas.addEventListener("mousemove", e => {
  if (!activeSticker) return;
  const rect = canvas.getBoundingClientRect();
  activeSticker.x = e.clientX - rect.left - offsetX;
  activeSticker.y = e.clientY - rect.top - offsetY;
  redraw();
});

canvas.addEventListener("mouseup", () => {
  activeSticker = null;
});

canvas.addEventListener("mouseleave", () => {
  activeSticker = null;
});

// download
downloadBtn.onclick = () => {
  const link = document.createElement("a");
  link.download = "our_photobooth.png";
  link.href = canvas.toDataURL();
  link.click();
};

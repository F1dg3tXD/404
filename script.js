 // Simple ambient flicker for status text and a lightweight RGB tap minigame

const statusCode = document.querySelector(".status-code");
const content = document.querySelector(".content");
const titleEl = document.querySelector(".page-title");

// Configure title from ?title= query parameter, if present
(() => {
  if (!titleEl) return;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("title");
  const value = raw ? raw.trim() : "";
  const safeTitle = value || window.location.hostname || "Offline host";
  titleEl.textContent = safeTitle;
  if (safeTitle) {
    document.title = `${safeTitle} — 404`;
  }
})();

// Flicker effect on the 404 status
function flicker(el, maxOffset = 0.3) {
  if (!el) return;
  const x = (Math.random() - 0.5) * maxOffset;
  const y = (Math.random() - 0.5) * maxOffset;
  const blur = 10 + Math.random() * 8;
  const r = `0 0 ${blur}px rgba(255, 51, 85, 0.45)`;
  const b = `0 0 ${blur}px rgba(51, 170, 255, 0.4)`;
  el.style.textShadow = `${x}px ${y}px ${blur}px rgba(0, 0, 0, 0.8), ${r}, ${b}`;
}

// Start immediately, and be gentle on battery:
let startTime = null;
function throttledLoop(ts) {
  if (!startTime) startTime = ts;
  const delta = ts - startTime;
  if (delta > 80) {
    startTime = ts;
    flicker(statusCode, 0.25);
  }
  requestAnimationFrame(throttledLoop);
}

requestAnimationFrame(throttledLoop);

// --- Minigame: tap the roaming RGB orb to capture fragments ---

const orb = document.querySelector(".minigame-orb");
const area = document.querySelector(".minigame-area");
const statusLine = document.querySelector(".minigame-status");
const statusCount = statusLine?.querySelector("span");

let captured = 0;
const target = 5;

function moveOrb() {
  if (!orb || !area) return;
  // Keep orb away from edges a bit
  const min = 10;
  const max = 90;
  const x = Math.random() * (max - min) + min;
  const y = Math.random() * (max - min) + min;
  orb.style.setProperty("--x", `${x - 50}%`);
  orb.style.setProperty("--y", `${y - 50}%`);
}

if (orb && area) {
  // Initial placement
  moveOrb();

  // Periodic drift
  const interval = setInterval(() => {
    if (!document.body.contains(orb)) {
      clearInterval(interval);
      return;
    }
    moveOrb();
  }, 1300);

  orb.addEventListener("pointerdown", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    orb.classList.add("hit");
    setTimeout(() => orb.classList.remove("hit"), 120);

    captured = Math.min(target, captured + 1);
    if (statusCount) {
      statusCount.textContent = captured.toString();
    }

    moveOrb();

    if (captured >= target && content && statusLine) {
      content.classList.add("content-online");
      statusLine.textContent = "Link briefly restored.";
    }
  });
}
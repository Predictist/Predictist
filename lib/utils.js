// lib/utils.js

// ---------- General Helpers ----------
export const utcYYYYMMDD = () => new Date().toISOString().split("T")[0];
export const classNames = (...c) => c.filter(Boolean).join(" ");
export const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export function pickDailyIndices(count, poolLen, seedStr) {
  let seed = seedStr.split("-").reduce((s, p) => s + parseInt(p, 10), 0);
  const taken = new Set();
  const out = [];
  while (out.length < Math.min(count, poolLen)) {
    seed = (seed * 9301 + 49297) % 233280;
    const idx = seed % poolLen;
    if (!taken.has(idx)) {
      taken.add(idx);
      out.push(idx);
    }
  }
  return out;
}

// ---------- Confetti ----------
export function spawnConfetti(burst = 60) {
  const container = document.createElement("div");
  container.className = "confetti-container";
  document.body.appendChild(container);

  for (let i = 0; i < burst; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.animationDelay = Math.random() * 2 + "s";
    c.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 60%)`;
    container.appendChild(c);
  }

  setTimeout(() => container.remove(), 4000);
}

// ---------- Toast ----------
export function showToast(message) {
  const el = document.createElement("div");
  el.className = "predictle-toast";
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 1800);
}

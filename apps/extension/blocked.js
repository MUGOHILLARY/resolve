// breathing.ts
var phases = [
  "Breathe In",
  "Hold",
  "Breathe Out",
  "Hold"
];
function startBreathing() {
  const text = document.getElementById("breathingText");
  if (!text) return;
  let index = 0;
  text.textContent = phases[index];
  setInterval(() => {
    index = (index + 1) % phases.length;
    text.textContent = phases[index];
  }, 4e3);
}

// stats.ts
async function loadStats() {
  document.getElementById("streak").textContent = "12";
  document.getElementById("money").textContent = "KES 4,250";
  document.getElementById("blocks").textContent = "18";
}

// quotes.ts
var quotes = [
  "One decision today changes tomorrow.",
  "Progress beats perfection.",
  "Your future self will thank you.",
  "Every urge resisted makes you stronger.",
  "Recovery is built one choice at a time.",
  "Freedom begins with one 'No'.",
  "You've already won by stopping.",
  "Small victories become lifelong habits."
];
function loadQuote() {
  const element = document.getElementById("quote");
  if (!element) return;
  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  element.textContent = quote;
}

// blocked.ts
document.addEventListener("DOMContentLoaded", async () => {
  startBreathing();
  await loadStats();
  loadQuote();
  const backButton = document.getElementById("back");
  backButton?.addEventListener("click", () => {
    history.back();
  });
  const coachButton = document.getElementById("coach");
  coachButton?.addEventListener("click", () => {
    chrome.tabs.create({
      url: "http://localhost:5173/ai-coach"
    });
  });
});

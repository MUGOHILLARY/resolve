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

// breathing.ts
var phases = [
  "Breathe In",
  "Hold",
  "Breathe Out",
  "Hold"
];
function startBreathingAnimation() {
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
var DEFAULT_STATS = {
  streak: 0,
  blockedToday: 0,
  moneySaved: 0,
  lastBlockedDate: ""
};
async function loadStats() {
  const result = await chrome.storage.local.get("resolveStats");
  const stats = result.resolveStats ?? DEFAULT_STATS;
  document.getElementById("streak").textContent = stats.streak.toString();
  document.getElementById("money").textContent = `KES ${stats.moneySaved.toLocaleString()}`;
  document.getElementById("blocks").textContent = stats.blockedToday.toString();
}

// blocked.ts
var quoteElement = document.getElementById("quote");
var coachButton = document.getElementById("coach");
var journalButton = document.getElementById("journal");
var backButton = document.getElementById("back");
startBreathingAnimation();
loadStats();
function updateQuote() {
  if (!quoteElement) return;
  const random = quotes[Math.floor(Math.random() * quotes.length)];
  quoteElement.textContent = random;
}
updateQuote();
setInterval(updateQuote, 15e3);
backButton?.addEventListener("click", () => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true
    },
    (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.update(tabs[0].id, {
        url: "https://www.google.com"
      });
    }
  );
});
coachButton?.addEventListener("click", () => {
  chrome.tabs.create({
    url: "http://localhost:5173/ai-coach"
  });
});
journalButton?.addEventListener("click", () => {
  chrome.tabs.create({
    url: "http://localhost:5173/recovery/journal"
  });
});

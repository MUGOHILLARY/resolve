import { quotes } from "./quotes";
import { startBreathingAnimation } from "./breathing";
import { loadStats } from "./stats";

const quoteElement = document.getElementById("quote") as HTMLElement;
const coachButton = document.getElementById("coach") as HTMLButtonElement;
const journalButton = document.getElementById("journal") as HTMLButtonElement;
const backButton = document.getElementById("back") as HTMLButtonElement;

// Start breathing animation
startBreathingAnimation();

// Load recovery statistics
loadStats();

// Show a random quote immediately
function updateQuote() {
  if (!quoteElement) return;

  const random =
    quotes[Math.floor(Math.random() * quotes.length)];

  quoteElement.textContent = random;
}

updateQuote();

// Change quote every 15 seconds
setInterval(updateQuote, 15000);

// Return to a safe page
backButton?.addEventListener("click", () => {
  chrome.tabs.query(
    { active: true, currentWindow: true },
    (tabs) => {
      if (!tabs[0]?.id) return;

      chrome.tabs.update(tabs[0].id, {
        url: "https://www.google.com",
      });
    }
  );
});

// Open Resolve AI Coach
coachButton?.addEventListener("click", () => {
  chrome.tabs.create({
    url: "http://localhost:5173/ai-coach",
  });
});

// Open Resolve Journal
journalButton?.addEventListener("click", () => {
  chrome.tabs.create({
    url: "http://localhost:5173/journal",
  });
});
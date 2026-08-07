import { quotes } from "./quotes";
import { startBreathingAnimation } from "./breathing";
import { loadStats } from "./stats";

const quoteElement =
  document.getElementById("quote") as HTMLElement | null;

const coachButton =
  document.getElementById("coach") as HTMLButtonElement | null;

const journalButton =
  document.getElementById("journal") as HTMLButtonElement | null;

const backButton =
  document.getElementById("back") as HTMLButtonElement | null;

/*
|--------------------------------------------------------------------------
| Breathing Animation
|--------------------------------------------------------------------------
*/

startBreathingAnimation();

/*
|--------------------------------------------------------------------------
| Recovery Statistics
|--------------------------------------------------------------------------
*/

loadStats();

/*
|--------------------------------------------------------------------------
| Recovery Quote
|--------------------------------------------------------------------------
*/

function updateQuote() {
  if (!quoteElement) return;

  const random =
    quotes[Math.floor(Math.random() * quotes.length)];

  quoteElement.textContent = random;
}

updateQuote();

// Change quote every 15 seconds
setInterval(updateQuote, 15000);

/*
|--------------------------------------------------------------------------
| Return To Safe Page
|--------------------------------------------------------------------------
*/

backButton?.addEventListener("click", () => {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      if (!tabs[0]?.id) return;

      chrome.tabs.update(tabs[0].id, {
        url: "https://www.google.com",
      });
    }
  );
});

/*
|--------------------------------------------------------------------------
| Open Resolve AI Coach
|--------------------------------------------------------------------------
*/

coachButton?.addEventListener("click", () => {
  chrome.tabs.create({
    url: "http://localhost:5173/ai-coach",
  });
});

/*
|--------------------------------------------------------------------------
| Open Resolve Journal
|--------------------------------------------------------------------------
*/

journalButton?.addEventListener("click", () => {
  chrome.tabs.create({
    url: "http://localhost:5173/recovery/journal",
  });
});
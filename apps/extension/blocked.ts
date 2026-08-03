import { startBreathing } from "./breathing";
import { loadStats } from "./stats";
import { loadQuote } from "./quotes";

document.addEventListener("DOMContentLoaded", async () => {
  // Start breathing animation
  startBreathing();

  // Load recovery statistics
  await loadStats();

  // Display a motivational quote
  loadQuote();

  // Go Back button
  const backButton = document.getElementById("back");

  backButton?.addEventListener("click", () => {
    history.back();
  });

  // AI Coach button
  const coachButton = document.getElementById("coach");

  coachButton?.addEventListener("click", () => {
    chrome.tabs.create({
      url: "http://localhost:5173/ai-coach",
    });
  });
});
export const quotes = [
  "One decision today changes tomorrow.",
  "Progress beats perfection.",
  "Your future self will thank you.",
  "Every urge resisted makes you stronger.",
  "Recovery is built one choice at a time.",
  "Freedom begins with one 'No'.",
  "You've already won by stopping.",
  "Small victories become lifelong habits.",
];

export function loadQuote() {
  const element = document.getElementById("quote");

  if (!element) return;

  const quote =
    quotes[Math.floor(Math.random() * quotes.length)];

  element.textContent = quote;
}
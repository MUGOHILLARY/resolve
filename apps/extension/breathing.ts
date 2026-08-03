const phases = [
  "Breathe In",
  "Hold",
  "Breathe Out",
  "Hold",
];

export function startBreathing() {
  const text = document.getElementById("breathingText");

  if (!text) return;

  let index = 0;

  text.textContent = phases[index];

  setInterval(() => {
    index = (index + 1) % phases.length;
    text.textContent = phases[index];
  }, 4000);
}
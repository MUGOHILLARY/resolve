const phases = [
  "Breathe In",
  "Hold",
  "Breathe Out",
  "Hold",
];

export function startBreathingAnimation() {
  const text = document.getElementById("breathingText");

  if (!text) return;

  let index = 0;

  text.textContent = phases[index];

  setInterval(() => {
    index = (index + 1) % phases.length;
    text.textContent = phases[index];
  }, 4000);
}

// Keep the older function name available as well.
export function startBreathing() {
  startBreathingAnimation();
}
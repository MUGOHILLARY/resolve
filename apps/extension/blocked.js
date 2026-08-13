// blocked.ts
document.addEventListener("DOMContentLoaded", async () => {
  console.log("\u{1F6E1}\uFE0F Resolve blocked page loaded.");
  const params = new URLSearchParams(window.location.search);
  const site = params.get("site")?.trim() || "This website";
  console.log("\u{1F6AB} Blocked site:", site);
  const blockedSiteElement = document.getElementById("blockedSite");
  if (blockedSiteElement) {
    blockedSiteElement.textContent = `${site} is blocked`;
  }
  try {
    const response = await chrome.runtime.sendMessage({
      type: "RESOLVE_BLOCKED_PAGE_OPENED",
      domain: site,
      timestamp: Date.now()
    });
    console.log(
      "\u{1F4CA} Resolve blocked-page event response:",
      response
    );
    if (response?.success) {
      updateStatistics(response);
    }
  } catch (error) {
    console.warn(
      "\u26A0\uFE0F Could not notify Resolve background:",
      error
    );
  }
  const breathingText = document.getElementById("breathingText");
  const circle = document.getElementById("circle");
  if (breathingText && circle) {
    let breathingIn = true;
    const updateBreathing = () => {
      if (breathingIn) {
        breathingText.textContent = "Breathe In";
        circle.classList.remove("breathe-out");
        circle.classList.add("breathe-in");
      } else {
        breathingText.textContent = "Breathe Out";
        circle.classList.remove("breathe-in");
        circle.classList.add("breathe-out");
      }
      breathingIn = !breathingIn;
    };
    updateBreathing();
    window.setInterval(
      updateBreathing,
      4e3
    );
  }
  const backButton = document.getElementById("back");
  backButton?.addEventListener("click", () => {
    window.location.href = "about:blank";
  });
  const coachButton = document.getElementById("coach");
  coachButton?.addEventListener("click", () => {
    chrome.tabs.create({
      url: "https://resolve-web-two.vercel.app/"
    });
  });
  const journalButton = document.getElementById("journal");
  journalButton?.addEventListener("click", () => {
    chrome.tabs.create({
      url: "https://resolve-web-two.vercel.app/"
    });
  });
});
function updateStatistics(data) {
  const blocksElement = document.getElementById("blocks");
  const streakElement = document.getElementById("streak");
  const moneyElement = document.getElementById("money");
  if (blocksElement) {
    const blockedToday = Number(data.blockedToday ?? 0);
    blocksElement.textContent = String(blockedToday);
  }
  if (streakElement) {
    const recoveryDays = Number(data.recoveryDays ?? 0);
    streakElement.textContent = String(recoveryDays);
  }
  if (moneyElement) {
    const moneySaved = Number(data.moneySaved ?? 0);
    moneyElement.textContent = `KES ${moneySaved.toLocaleString()}`;
  }
}

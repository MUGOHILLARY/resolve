export async function loadStats() {
  (
    document.getElementById("streak") as HTMLElement
  ).textContent = "12";

  (
    document.getElementById("money") as HTMLElement
  ).textContent = "KES 4,250";

  (
    document.getElementById("blocks") as HTMLElement
  ).textContent = "18";
}
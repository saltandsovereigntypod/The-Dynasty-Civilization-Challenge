const STORAGE_KEY = "dynastyCivilizationChapterOne";

const checkboxes = [...document.querySelectorAll("[data-check-id]")];
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const resetButton = document.getElementById("resetChecklistButton");

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

let savedProgress = loadProgress();

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProgress));
}

function updateProgressDisplay() {
  const completed = checkboxes.filter((checkbox) => checkbox.checked).length;
  const total = checkboxes.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressText.textContent = `${completed} of ${total} complete`;
  progressBar.style.width = `${percent}%`;
}

checkboxes.forEach((checkbox) => {
  const id = checkbox.dataset.checkId;
  checkbox.checked = Boolean(savedProgress[id]);

  checkbox.addEventListener("change", () => {
    savedProgress[id] = checkbox.checked;
    saveProgress();
    updateProgressDisplay();
  });
});

resetButton.addEventListener("click", () => {
  const confirmed = window.confirm("Reset every Chapter I objective?");
  if (!confirmed) return;

  savedProgress = {};
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  saveProgress();
  updateProgressDisplay();
});

updateProgressDisplay();

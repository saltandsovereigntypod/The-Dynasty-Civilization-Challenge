const STORAGE_KEY = "dynastyCivilizationTreasury";

const balanceElement = document.getElementById("treasuryBalance");
const householdInput = document.getElementById("householdCount");
const taxRateInput = document.getElementById("taxRate");
const previewElement = document.getElementById("taxPreview");
const payTaxesButton = document.getElementById("payTaxesButton");
const expenseInput = document.getElementById("expenseAmount");
const reasonInput = document.getElementById("expenseReason");
const deductButton = document.getElementById("deductButton");
const historyElement = document.getElementById("transactionHistory");
const statusElement = document.getElementById("taxStatus");
const clearButton = document.getElementById("clearHistoryButton");

function defaultState() {
  return {
    balance: 0,
    households: 0,
    taxRate: 100,
    transactions: []
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved.balance === "number"
      ? { ...defaultState(), ...saved }
      : defaultState();
  } catch {
    return defaultState();
  }
}

let state = loadState();

function formatMoney(amount) {
  return `§${Math.abs(amount).toLocaleString()}`;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderPreview() {
  const households = Math.max(0, Number(householdInput.value) || 0);
  const rate = Math.max(0, Number(taxRateInput.value) || 0);
  previewElement.textContent = `Weekly collection: ${formatMoney(households * rate)}`;
}

function renderHistory() {
  historyElement.innerHTML = "";

  if (state.transactions.length === 0) {
    historyElement.innerHTML = '<p class="empty-state">No treasury activity has been recorded yet.</p>';
    return;
  }

  [...state.transactions].reverse().forEach((transaction) => {
    const row = document.createElement("div");
    row.className = "transaction";

    const details = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = transaction.reason;
    const date = document.createElement("small");
    date.textContent = new Date(transaction.date).toLocaleString();

    details.append(title, date);

    const amount = document.createElement("strong");
    amount.className = transaction.amount >= 0 ? "positive" : "negative";
    amount.textContent = `${transaction.amount >= 0 ? "+" : "−"}${formatMoney(transaction.amount)}`;

    row.append(details, amount);
    historyElement.appendChild(row);
  });
}

function render() {
  balanceElement.textContent = formatMoney(state.balance);
  householdInput.value = state.households;
  taxRateInput.value = state.taxRate;
  renderPreview();
  renderHistory();
}

householdInput.addEventListener("input", () => {
  state.households = Math.max(0, Number(householdInput.value) || 0);
  saveState();
  renderPreview();
});

taxRateInput.addEventListener("input", () => {
  state.taxRate = Math.max(0, Number(taxRateInput.value) || 0);
  saveState();
  renderPreview();
});

payTaxesButton.addEventListener("click", () => {
  const amount = state.households * state.taxRate;

  if (amount <= 0) {
    statusElement.textContent = "Enter at least one outside household and a tax rate above zero.";
    return;
  }

  state.balance += amount;
  state.transactions.push({
    amount,
    reason: `Weekly taxes from ${state.households} household${state.households === 1 ? "" : "s"}`,
    date: new Date().toISOString()
  });

  statusElement.textContent = `${formatMoney(amount)} was added to the treasury.`;
  saveState();
  render();
});

deductButton.addEventListener("click", () => {
  const amount = Math.max(0, Number(expenseInput.value) || 0);
  const reason = reasonInput.value.trim() || "Civilization expense";

  if (amount <= 0) {
    statusElement.textContent = "Enter an expense greater than zero.";
    return;
  }

  state.balance -= amount;
  state.transactions.push({
    amount: -amount,
    reason,
    date: new Date().toISOString()
  });

  expenseInput.value = "";
  reasonInput.value = "";
  statusElement.textContent = `${formatMoney(amount)} was deducted from the treasury.`;
  saveState();
  render();
});

clearButton.addEventListener("click", () => {
  const confirmed = window.confirm("Reset the entire treasury and delete its history?");
  if (!confirmed) return;

  state = defaultState();
  saveState();
  statusElement.textContent = "The treasury has been reset.";
  render();
});

render();

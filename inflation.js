// Utility: compound a value by rate over n years
function compound(value, ratePct, years) {
  const r = ratePct / 100;
  return value * Math.pow(1 + r, years);
}
  
document.getElementById('apply-inflation').addEventListener('click', () => {
  const rate = parseFloat(document.getElementById('inflation-rate').value) || 0;
  const years = parseInt(document.getElementById('inflation-years').value, 10) || 1;
  
  // Recalculate each income/expense input
  document.querySelectorAll('.income-value').forEach(input => {
    const base = parseFloat(input.value) || 0;
    input.value = compound(base, rate, years).toFixed(2);
  });
  document.querySelectorAll('.expense-value').forEach(input => {
    const base = parseFloat(input.value) || 0;
    input.value = compound(base, rate, years).toFixed(2);
  });

  // Re‑compute totals
  updateBudget();
});
  
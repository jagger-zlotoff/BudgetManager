// Utility: compound a value by rate over n years
function compound(value, ratePct, years) {
  const r = ratePct / 100;
  return value * Math.pow(1 + r, years);
}
  
document.getElementById('apply-inflation').addEventListener('click', () => {
  const rate = parseFloat(document.getElementById('inflation-rate').value) || 0;
  const years = parseInt(document.getElementById('inflation-years').value, 10) || 1;

  const before = parseFloat(document.getElementById('inflation-value-input').value) || 0;

  const after = parseFloat(compound(before, rate, years));

  document.getElementById('inflation-result').innerText = after.toLocaleString('en-US');
});
  
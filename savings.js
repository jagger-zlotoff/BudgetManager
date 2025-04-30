document.addEventListener("DOMContentLoaded", () => {
    const freqMap = {
      "daily": 365,
      "monthly": 12,
      "quarterly": 4,
      "semi-annually": 2,
      "yearly": 1
    };
  
    let growthChart = null;
  
    function formatMoney(x) {
      return x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  
    function addPeriod(date, freq) {
      const d = new Date(date);
      switch(freq) {
        case "daily": d.setDate(d.getDate() + 1); break;
        case "monthly": d.setMonth(d.getMonth() + 1); break;
        case "quarterly": d.setMonth(d.getMonth() + 3); break;
        case "semi-annually": d.setMonth(d.getMonth() + 6); break;
        case "yearly": d.setFullYear(d.getFullYear() + 1); break;
      }
      return d;
    }
  
    function calculateSavings() {
      // gather inputs
      const P = parseFloat(document.getElementById("savings-initial").value);
      const years = parseInt(document.getElementById("savings-term").value, 10);
      const apr = parseFloat(document.getElementById("savings-apr").value) / 100;
      const startDate = new Date(document.getElementById("savings-start-date").value);
      const compStr = document.getElementById("savings-compound").value;
  
      if (isNaN(P) || isNaN(years) || isNaN(apr) || !startDate.getTime()) {
        document.getElementById("savings-error-text").classList.remove("hidden");
        return;
      }
      document.getElementById("savings-error-text").classList.add("hidden");
  
      const m = freqMap[compStr];             // periods per year
      const n = years * m;                    // total periods
      const r = apr / m;                      // rate per period
  
      // schedule arrays
      const balances = [];
      const interestEarned = [];
      let balance = P;
      let currDate = new Date(startDate);
  
      // clear table
      const tbody = document.querySelector("#savings-schedule-table tbody");
      tbody.innerHTML = "";
  
      for (let i = 1; i <= n; i++) {
        const interest = balance * r;
        balance += interest;
        balances.push(balance);
        interestEarned.push(interest);
  
        // add table row
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${i}</td>
          <td>${currDate.toLocaleDateString()}</td>
          <td>$${formatMoney(interest)}</td>
          <td>$${formatMoney(balance)}</td>
        `;
        tbody.appendChild(tr);
  
        currDate = addPeriod(currDate, compStr);
      }
  
      // display final value
      document.getElementById("future-value").innerText = formatMoney(balance);
  
      // render Chart.js line chart
      const ctx = document.getElementById("growthChart").getContext("2d");
      if (growthChart) growthChart.destroy();
      growthChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: [...Array(n)].map((_,i)=> i+1),
          datasets: [{
            label: "Balance Over Time",
            data: balances,
            fill: true,
            tension: 0.2,
            borderColor: "green",
            backgroundColor: "rgba(75,192,192,0.2)"
          }]
        },
        options: {
          scales: {
            x: { title: { display: true, text: "Period #" } },
            y: { title: { display: true, text: "Balance ($)" } }
          }
        }
      });
    }
  
    document.getElementById("calculate-savings-btn")
            .addEventListener("click", calculateSavings);
  
    // live-update as inputs change
    ["savings-initial","savings-term","savings-apr","savings-start-date","savings-compound"]
      .forEach(id =>
        document.getElementById(id).addEventListener("input", calculateSavings)
      );
  });
  
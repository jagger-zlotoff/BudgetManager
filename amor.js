document.addEventListener("DOMContentLoaded", function () {
    // Only run this code if the amortization calculator exists on the page.
    if (document.getElementById("calculate-btn")) {
      // Reference for the Chart.js instance, so it can be destroyed and updated.
      let balanceChartInstance = null;
  
      // Mapping for frequency strings to numerical values.
      const freqMapping = {
        "weekly": 52,
        "bi-weekly": 26,
        "semi-monthly": 24,
        "monthly": 12,
        "bi-monthly": 6,
        "quarterly": 4,
        "semi-annually": 2,
        "yearly": 1
      };
  
      // Helper function to format numbers to 2 decimal places.
      function formatNumber(num) {
        return num.toLocaleString('en-US');
      }
  
      // Add a period to a date based on the payment frequency.
      function addPeriod(date, freq) {
        let newDate = new Date(date);
        switch (freq) {
          case "weekly":
            newDate.setDate(newDate.getDate() + 7);
            break;
          case "bi-weekly":
            newDate.setDate(newDate.getDate() + 14);
            break;
          case "semi-monthly":
            newDate.setDate(newDate.getDate() + 15);
            break;
          case "monthly":
            newDate.setMonth(newDate.getMonth() + 1);
            break;
          case "bi-monthly":
            newDate.setMonth(newDate.getMonth() + 2);
            break;
          case "quarterly":
            newDate.setMonth(newDate.getMonth() + 3);
            break;
          case "semi-annually":
            newDate.setMonth(newDate.getMonth() + 6);
            break;
          case "yearly":
            newDate.setFullYear(newDate.getFullYear() + 1);
            break;
          default:
            newDate.setMonth(newDate.getMonth() + 1);
        }
        return newDate;
      }
  
      // Function to calculate the amortization schedule and update the page.
      function calculateAmortization() {
        // Retrieve input values.
        const termYears = parseFloat(document.getElementById("loan-term-input").value);
        const principal = parseFloat(document.getElementById("loan-amount-input").value);
        const apr = parseFloat(document.getElementById("apr-input").value);
        const firstPaymentDate = new Date(document.getElementById("first-payment-date").value);
        const paymentType = document.getElementById("payment-type").value;
        const paymentFreqStr = document.getElementById("payment-freq").value;
        const compoundFreqStr = document.getElementById("compound-freq").value;
  
        // Validate inputs.
        if (isNaN(termYears) || isNaN(principal) || isNaN(apr) || !firstPaymentDate.getTime()) {
          document.getElementById("calc-error-text").classList.remove("hidden");
          console.log("Error")
          return;
        }
        else {
          document.getElementById("calc-error-text").classList.add("hidden");
        }
  
        const paymentFreq = freqMapping[paymentFreqStr];
        const compoundFreq = freqMapping[compoundFreqStr];
        const n = termYears * paymentFreq; // Total number of payments.
        const annualRate = apr / 100;
        // Effective rate per payment period.
        const r = Math.pow(1 + annualRate / compoundFreq, compoundFreq / paymentFreq) - 1;
  
        // Calculate payment amount.
        let payment;
        if (r === 0) {
          payment = principal / n;
        } else {
          payment = principal * r / (1 - Math.pow(1 + r, -n));
          if (paymentType === "beginning") {
            payment = payment / (1 + r);
          }
        }
  
        // Update the periodic payment amount on the page.
        document.getElementById("payment-amount").textContent = formatNumber(payment);
  
        // Initialize arrays for the schedule table and chart.
        let balances = [];
        let balance = principal;
        let currentDate = new Date(firstPaymentDate);
        const scheduleBody = document.querySelector("#schedule-table tbody");
        scheduleBody.innerHTML = ""; // Clear previous schedule.
  
        // Build the amortization schedule.
        for (let i = 1; i <= n; i++) {
          let interest, principalPaid;
          if (paymentType === "beginning" && i === 1) {
            interest = 0;
            principalPaid = payment;
          } else {
            interest = balance * r;
            principalPaid = payment - interest;
          }
          // Avoid overpaying in the final payment.
          if (principalPaid > balance) {
            principalPaid = balance;
            payment = interest + principalPaid;
          }
          balance -= principalPaid;
          if (balance < 0) balance = 0;
  
          // Save the balance for charting.
          balances.push(balance);
  
          // Create a new row in the schedule table.
          const row = document.createElement("tr");
          const dueDateStr = currentDate.toLocaleDateString();
          row.innerHTML = `
            <td>${i}</td>
            <td>${dueDateStr}</td>
            <td>$${formatNumber(interest)}</td>
            <td>$${formatNumber(principalPaid)}</td>
            <td>$${formatNumber(balance)}</td>
          `;
          scheduleBody.appendChild(row);
  
          // Increment the due date for the next payment.
          currentDate = addPeriod(currentDate, paymentFreqStr);
        }
  
        // --- Chart.js Graph ---
        // Check if the canvas element for the chart exists.
        if (document.getElementById("balanceChart")) {
          // If a chart already exists, destroy it before creating a new one.
          if (balanceChartInstance) {
            balanceChartInstance.destroy();
          }
          const ctx = document.getElementById("balanceChart").getContext("2d");
          balanceChartInstance = new Chart(ctx, {
            type: "line",
            data: {
              labels: Array.from({ length: n }, (_, i) => i + 1), // Payment numbers 1...n.
              datasets: [{
                label: "Remaining Balance",
                data: balances,
                borderColor: "blue",
                backgroundColor: "rgba(54, 162, 235, 0.1)",
                fill: true,
                tension: 0.2
              }]
            },
            options: {
              responsive: true,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Payment Number"
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: "Balance ($)"
                  }
                }
              }
            }
          });
        }
      }
  
      // Attach the event listener to the Calculate button.
      document.getElementById("calculate-btn").addEventListener("click", calculateAmortization);


      // Enable live updates by listening for updates to each field
      document.getElementById("loan-term-input").addEventListener("input", calculateAmortization);
      document.getElementById("loan-amount-input").addEventListener("input", calculateAmortization);
      document.getElementById("apr-input").addEventListener("input", calculateAmortization);
      document.getElementById("first-payment-date").addEventListener("input", calculateAmortization);
      document.getElementById("payment-type").addEventListener("input", calculateAmortization);
      document.getElementById("payment-freq").addEventListener("input", calculateAmortization);
      document.getElementById("compound-freq").addEventListener("input", calculateAmortization);


    }
  });
  
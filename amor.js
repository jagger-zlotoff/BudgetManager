document.addEventListener("DOMContentLoaded", function () {
    // Only run this code if the amortization calculator exists
    if (document.getElementById("calculate-btn")) {
  
      // Mapping for frequency strings to numerical values
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
  
      // Format a number to 2 decimal places
      function formatNumber(num) {
        return num.toFixed(2);
      }
  
      // Add a period to a date based on frequency
      function addPeriod(date, freq) {
        let newDate = new Date(date);
        switch(freq) {
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
  
      // Function to calculate amortization and update the page
      function calculateAmortization() {
        // Retrieve input values
        const termYears = parseFloat(document.getElementById('loan-term-input').value);
        const principal = parseFloat(document.getElementById('loan-amount-input').value);
        const apr = parseFloat(document.getElementById('apr-input').value);
        const firstPaymentDate = new Date(document.getElementById('first-payment-date').value);
        const paymentType = document.getElementById('payment-type').value;
        const paymentFreqStr = document.getElementById('payment-freq').value;
        const compoundFreqStr = document.getElementById('compound-freq').value;
  
        // Check that required values are provided
        if (isNaN(termYears) || isNaN(principal) || isNaN(apr) || !firstPaymentDate.getTime()) {
          alert("Please fill in all fields with valid values.");
          return;
        }
  
        const paymentFreq = freqMapping[paymentFreqStr];
        const compoundFreq = freqMapping[compoundFreqStr];
        const n = termYears * paymentFreq; // total number of payments
        const annualRate = apr / 100;
  
        // Calculate effective rate per payment period
        const r = Math.pow(1 + annualRate / compoundFreq, compoundFreq / paymentFreq) - 1;
        
        // Calculate payment amount based on payment type
        let payment;
        if (r === 0) {
          payment = principal / n;
        } else {
          payment = principal * r / (1 - Math.pow(1 + r, -n));
          if (paymentType === "beginning") {
            payment = payment / (1 + r);
          }
        }
        
        // Update the payment amount in the DOM
        document.getElementById('payment-amount').textContent = formatNumber(payment);
  
        // Generate the amortization schedule
        let balance = principal;
        let currentDate = new Date(firstPaymentDate);
        const scheduleBody = document.querySelector('#schedule-table tbody');
        scheduleBody.innerHTML = ""; // Clear previous schedule
  
        for (let i = 1; i <= n; i++) {
          let interest, principalPaid;
  
          // For beginning-of-period payments, assume first payment has zero interest
          if (paymentType === "beginning" && i === 1) {
            interest = 0;
            principalPaid = payment;
          } else {
            interest = balance * r;
            principalPaid = payment - interest;
          }
  
          // Ensure we don't overpay on the last payment
          if (principalPaid > balance) {
            principalPaid = balance;
            payment = interest + principalPaid;
          }
  
          balance -= principalPaid;
          if (balance < 0) balance = 0;
  
          // Create a new table row
          const row = document.createElement("tr");
          
          // Format the due date as a locale date string
          const dueDateStr = currentDate.toLocaleDateString();
  
          row.innerHTML = `
            <td>${i}</td>
            <td>${dueDateStr}</td>
            <td>$${formatNumber(interest)}</td>
            <td>$${formatNumber(principalPaid)}</td>
            <td>$${formatNumber(balance)}</td>
          `;
          scheduleBody.appendChild(row);
  
          // Increment the due date for the next payment period
          currentDate = addPeriod(currentDate, paymentFreqStr);
        }
      }
  
      // Add event listener to the Calculate button
      document.getElementById('calculate-btn').addEventListener('click', calculateAmortization);
    }
  });
  
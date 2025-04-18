document.addEventListener("DOMContentLoaded", function () {
    console.log(" Script loaded and running!");

    /** ---------------- Income & Expenses Section ---------------- **/

    let incomeItems = [];
    let expenseItems = [];

    function updateBudget() {
        let totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
        let totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
        let remainingBalance = totalIncome - totalExpenses;

        document.getElementById("total-income").innerText = `${totalIncome.toLocaleString('en-US')}`;
        document.getElementById("total-expenses").innerText = `${totalExpenses.toLocaleString('en-US')}`;
        document.getElementById("remaining-balance").innerText = `${remainingBalance.toLocaleString('en-US')}`;
    }

    function addIncomeItem() {
        let incomeList = document.getElementById("income-list");
        let newItem = document.createElement("div");
        newItem.classList.add("budget-item");

        newItem.innerHTML = `
            <input type="text" class="income-name" placeholder="Income source">
            <input type="number" class="income-value" placeholder="$" min="0" step="0.01">
            <button class="delete-item"><img src="images/del-icon.png"></button>
        `;

        incomeList.appendChild(newItem);

        let deleteButton = newItem.querySelector(".delete-item");
        deleteButton.addEventListener("click", function () {
            let index = incomeItems.findIndex(item => item.element === newItem);
            if (index !== -1) {
                incomeItems.splice(index, 1);
            }
            newItem.remove();
            updateBudget();
        });

        let inputField = newItem.querySelector(".income-value");
        inputField.addEventListener("input", function () {
            let index = incomeItems.findIndex(item => item.element === newItem);
            if (index !== -1) {
                incomeItems[index].amount = parseFloat(inputField.value) || 0;
            } else {
                incomeItems.push({ element: newItem, amount: parseFloat(inputField.value) || 0 });
            }
            updateBudget();
        });
    }

    function addExpenseItem() {
        let expenseList = document.getElementById("expense-list");
        let newItem = document.createElement("div");
        newItem.classList.add("budget-item");

        newItem.innerHTML = `
            <input type="text" class="expense-name" placeholder="Expense name">
            <input type="number" class="expense-value" placeholder="$" min="0" step="0.01">
            <button class="delete-item"><img src="images/del-icon.png"></button>
        `;

        expenseList.appendChild(newItem);

        let deleteButton = newItem.querySelector(".delete-item");
        deleteButton.addEventListener("click", function () {
            let index = expenseItems.findIndex(item => item.element === newItem);
            if (index !== -1) {
                expenseItems.splice(index, 1);
            }
            newItem.remove();
            updateBudget();
        });

        let inputField = newItem.querySelector(".expense-value");
        inputField.addEventListener("input", function () {
            let index = expenseItems.findIndex(item => item.element === newItem);
            if (index !== -1) {
                expenseItems[index].amount = parseFloat(inputField.value) || 0;
            } else {
                expenseItems.push({ element: newItem, amount: parseFloat(inputField.value) || 0 });
            }
            updateBudget();
        });
    }

    document.getElementById("add-income-button").addEventListener("click", addIncomeItem);
    document.getElementById("add-expense-button").addEventListener("click", addExpenseItem);

    console.log(" Income & Expense event listeners attached successfully.");
    addIncomeItem();
    addExpenseItem();
    

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
  

        // -------------------- SSE Real-Time Updates --------------------
    // Check if EventSource is supported by the browser
    if (!!window.EventSource) {
        const evtSource = new EventSource('/events');

        evtSource.onmessage = function (event) {
            console.log("SSE received:", event.data);
            // Parse the JSON data received from the server
            const message = JSON.parse(event.data);

            // Check for an existing "updates" container; if not, create one.
            let updatesContainer = document.getElementById('updates');
            if (!updatesContainer) {
                updatesContainer = document.createElement('div');
                updatesContainer.id = 'updates';
                updatesContainer.style.border = '1px solid #ccc';
                updatesContainer.style.padding = '10px';
                updatesContainer.style.margin = '10px';
                updatesContainer.style.maxHeight = '200px';
                updatesContainer.style.overflowY = 'auto';
                // Append this container to the bottom of the body
                document.body.appendChild(updatesContainer);
            }

            // Create a new message div to display the event
            const newMsg = document.createElement('div');
            // Use the user's provided name, or fallback to the IP
            newMsg.innerHTML = `<strong>${message.modifiedBy}</strong> performed <em>${message.action}</em> with data: ${JSON.stringify(message.data)}`;
            // Optionally, style the message a bit:
            newMsg.style.padding = '5px';
            newMsg.style.borderBottom = '1px solid #eee';

            // Insert the new message at the top of the container
            updatesContainer.insertBefore(newMsg, updatesContainer.firstChild);
        };

        evtSource.onerror = function (err) {
            console.error('SSE error:', err);
        };
    } else {
        console.warn('Your browser does not support Server-Sent Events.');
    }
});



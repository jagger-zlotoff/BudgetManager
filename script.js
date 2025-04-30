document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded and running!");

    /** ---------------- Income & Expenses Section ---------------- **/

    // → MODE SWITCHING
    const tabMonthly = document.getElementById('tab-monthly');
    const tabYearly = document.getElementById('tab-yearly');
    const summaryTitle = document.getElementById('summary-title');
    let summaryMode = 'monthly'; // or 'yearly'

    function setMode(mode) {
        summaryMode = mode;
        tabMonthly.classList.toggle('active', mode === 'monthly');
        tabYearly.classList.toggle('active', mode === 'yearly');
        summaryTitle.textContent = mode === 'monthly'
            ? 'Monthly Summary'
            : 'Yearly Summary';
        updateBudget();
    }

    tabMonthly.addEventListener('click', () => setMode('monthly'));
    tabYearly.addEventListener('click', () => setMode('yearly'));


    let incomeItems = [];
    let expenseItems = [];

    function updateBudget() {
        const factor = summaryMode === 'yearly' ? 12 : 1;

        let totalIncome = incomeItems
            .reduce((sum, item) => sum + item.amount, 0) * factor;
        let totalExpenses = expenseItems
            .reduce((sum, item) => sum + item.amount, 0) * factor;
        let remainingBalance = totalIncome - totalExpenses;

        document.getElementById("total-income").innerText =
            totalIncome.toLocaleString('en-US');
        document.getElementById("total-expenses").innerText =
            totalExpenses.toLocaleString('en-US');
        document.getElementById("remaining-balance").innerText =
            remainingBalance.toLocaleString('en-US');
    }


    function addIncomeItem() {
        const incomeList = document.getElementById("income-list");
        const newItem = document.createElement("div");
        newItem.classList.add("budget-item");

        newItem.innerHTML = `
            <input type="text" class="income-name" placeholder="Income source">
            <input type="number" class="income-value" placeholder="$" min="0" step="0.01">
            <button class="delete-item"><img src="images/del-icon.png"></button>
        `;

        incomeList.appendChild(newItem);

        const deleteButton = newItem.querySelector(".delete-item");
        deleteButton.addEventListener("click", function () {
            const index = incomeItems.findIndex(item => item.element === newItem);
            if (index !== -1) incomeItems.splice(index, 1);
            newItem.remove();
            updateBudget();
        });

        const inputField = newItem.querySelector(".income-value");
        inputField.addEventListener("input", function () {
            const value = parseFloat(inputField.value) || 0;
            const index = incomeItems.findIndex(item => item.element === newItem);
            if (index !== -1) {
                incomeItems[index].amount = value;
            } else {
                incomeItems.push({ element: newItem, amount: value });
            }
            updateBudget();
        });
    }

    function addExpenseItem() {
        const expenseList = document.getElementById("expense-list");
        const newItem = document.createElement("div");
        newItem.classList.add("budget-item");

        newItem.innerHTML = `
            <input type="text" class="expense-name" placeholder="Expense name">
            <input type="number" class="expense-value" placeholder="$" min="0" step="0.01">
            <button class="delete-item"><img src="images/del-icon.png"></button>
        `;

        expenseList.appendChild(newItem);

        const deleteButton = newItem.querySelector(".delete-item");
        deleteButton.addEventListener("click", function () {
            const index = expenseItems.findIndex(item => item.element === newItem);
            if (index !== -1) expenseItems.splice(index, 1);
            newItem.remove();
            updateBudget();
        });

        const inputField = newItem.querySelector(".expense-value");
        inputField.addEventListener("input", function () {
            const value = parseFloat(inputField.value) || 0;
            const index = expenseItems.findIndex(item => item.element === newItem);
            if (index !== -1) {
                expenseItems[index].amount = value;
            } else {
                expenseItems.push({ element: newItem, amount: value });
            }
            updateBudget();
        });
    }

    document.getElementById("add-income-button").addEventListener("click", addIncomeItem);
    document.getElementById("add-expense-button").addEventListener("click", addExpenseItem);

    console.log("Income & Expense event listeners attached successfully.");
    addIncomeItem();
    addExpenseItem();

    /** ---------------- SSE Real-Time Updates ---------------- **/

    if (window.EventSource) {
        const evtSource = new EventSource('/events');
        evtSource.onmessage = function (event) {
            console.log("SSE received:", event.data);
            const message = JSON.parse(event.data);

            let updatesContainer = document.getElementById('updates');
            if (!updatesContainer) {
                updatesContainer = document.createElement('div');
                updatesContainer.id = 'updates';
                updatesContainer.style.border = '1px solid #ccc';
                updatesContainer.style.padding = '10px';
                updatesContainer.style.margin = '10px';
                updatesContainer.style.maxHeight = '200px';
                updatesContainer.style.overflowY = 'auto';
                document.body.appendChild(updatesContainer);
            }

            const newMsg = document.createElement('div');
            newMsg.innerHTML =
                `<strong>${message.modifiedBy}</strong> performed <em>${message.action}</em>
                 with data: ${JSON.stringify(message.data)}`;
            newMsg.style.padding = '5px';
            newMsg.style.borderBottom = '1px solid #eee';

            updatesContainer.insertBefore(newMsg, updatesContainer.firstChild);
        };
        evtSource.onerror = err => console.error('SSE error:', err);
    } else {
        console.warn('Your browser does not support Server-Sent Events.');
    }

    /** —— Voice Input + Vibration Integration —— **/

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recogBtn = document.getElementById('speak-expense-button');
        recogBtn.style.display = 'block';

        // A key in localStorage so we only ever show the hint once
        const HINT_KEY = 'speakExpenseHintShown';

        const recognizer = new SpeechRecognition();
        recognizer.lang = 'en-US';
        recognizer.interimResults = false;
        recognizer.maxAlternatives = 1;

        recogBtn.addEventListener('click', () => {
            // 1) Show usage hint only the very first time
            if (!localStorage.getItem(HINT_KEY)) {
                alert(
                    `Tap “Speak Expense” and say something like “coffee 3.50” — your phone will record you, parse out the amount, and add it as an expense automatically.`
                );
                localStorage.setItem(HINT_KEY, 'true');
            }

            // 2) Then start listening
            recognizer.start();
            recogBtn.disabled = true;
            recogBtn.textContent = 'Listening…';
        });

        recognizer.addEventListener('result', event => {
            const transcript = event.results[0][0].transcript.trim();
            const parts = transcript.split(' ');
            const rawAmount = parts.pop().replace(/[^0-9.]/g, '');
            const desc = parts.join(' ');
            const amount = parseFloat(rawAmount);

            if (desc && !isNaN(amount)) {
                const expenseList = document.getElementById('expense-list');
                const newItem = document.createElement('div');
                newItem.classList.add('budget-item');
                newItem.innerHTML = `
                <input type="text" class="expense-name" value="${desc}">
                <input type="number" class="expense-value" value="${amount.toFixed(2)}">
                <button class="delete-item"><img src="images/del-icon.png"></button>
            `;
                expenseList.appendChild(newItem);

                // Add to expenseItems so updateBudget includes it
                expenseItems.push({ element: newItem, amount: amount });

                // Delete listener
                newItem.querySelector('.delete-item').addEventListener('click', () => {
                    const idx = expenseItems.findIndex(e => e.element === newItem);
                    if (idx > -1) expenseItems.splice(idx, 1);
                    newItem.remove();
                    updateBudget();
                });

                // Input listener to keep amount in sync
                newItem.querySelector('.expense-value').addEventListener('input', evt => {
                    const val = parseFloat(evt.target.value) || 0;
                    const idx = expenseItems.findIndex(e => e.element === newItem);
                    if (idx > -1) expenseItems[idx].amount = val;
                    updateBudget();
                });

                updateBudget();

                // Simple vibration feedback (Android only)
                if (navigator.vibrate) navigator.vibrate(200);
            } else {
                alert('Sorry, I could not parse that. Try: "coffee 3.50"');
            }
        });

        recognizer.addEventListener('end', () => {
            recogBtn.disabled = false;
            recogBtn.textContent = '🎤 Speak Expense';
        });

        recognizer.addEventListener('error', err => {
            console.error('Speech error', err);
            recogBtn.disabled = false;
            recogBtn.textContent = '🎤 Speak Expense';
            if (err.error === 'not-allowed') {
                recogBtn.style.display = 'none';
                alert('Microphone permission denied. Please type your expense instead.');
            }
        });
    } else {
        console.warn('SpeechRecognition not supported');
    }

});

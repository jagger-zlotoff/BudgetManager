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
    
});

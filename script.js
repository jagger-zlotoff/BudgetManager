document.addEventListener("DOMContentLoaded", function () {
    console.log(" Script loaded and running!");

    /** ---------------- Income & Expenses Section ---------------- **/

    let incomeItems = [];
    let expenseItems = [];

    function updateBudget() {
        let totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
        let totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
        let remainingBalance = totalIncome - totalExpenses;

        document.getElementById("total-income").innerText = `Total Income: $${totalIncome.toFixed(2)}`;
        document.getElementById("total-expenses").innerText = `Total Expenses: $${totalExpenses.toFixed(2)}`;
        document.getElementById("remaining-balance").innerText = `Remaining Balance: $${remainingBalance.toFixed(2)}`;
    }

    function addIncomeItem() {
        let incomeList = document.getElementById("income-list");
        let newItem = document.createElement("div");
        newItem.classList.add("budget-item");

        newItem.innerHTML = `
            <input type="text" class="income-name" placeholder="Income source">
            <input type="number" class="income-value" placeholder="$" min="0" step="0.01">
            <button class="delete-item">X</button>
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
            <button class="delete-item">X</button>
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

    /** ---------------- API / AJAX Section ---------------- **/

    document.getElementById("postMessageForm").addEventListener("submit", postMessage);
    document.getElementById("putMessageForm").addEventListener("submit", updateMessage);
    document.getElementById("deleteMessageForm").addEventListener("submit", deleteMessage);

    document.getElementById("clearPostForm").addEventListener("click", () => {
        document.getElementById("messageInput").value = "";
    });

    document.getElementById("clearPutForm").addEventListener("click", () => {
        document.getElementById("updateId").value = "";
        document.getElementById("updateMessage").value = "";
    });

    document.getElementById("clearDeleteForm").addEventListener("click", () => {
        document.getElementById("deleteId").value = "";
    });

    // Fetch messages once when the page loads
    fetchMessages();

    // Fetch all messages (AJAX GET)
    function fetchMessages() {
        fetch("https://budgetbuilder.mooo.com/api/messages")
            .then(response => response.json())
            .then(data => {
                const messageList = document.getElementById("messageList");
                messageList.innerHTML = ""; // Clear previous messages

                if (!Array.isArray(data)) {
                    console.error("Error: API response is not an array", data);
                    messageList.innerHTML = "<li>Error loading messages.</li>";
                    return;
                }

                data.forEach((msg, index) => {
                    const li = document.createElement("li");
                    li.textContent = `Message ${index + 1}: ${msg}`;
                    messageList.appendChild(li);
                });

                console.log("Messages fetched successfully!", data);
            })
            .catch(error => {
                console.error("Error fetching messages:", error);
                document.getElementById("messageList").innerHTML = "<li>Error loading messages.</li>";
            });
    }

    // Post a new message (AJAX POST)
    function postMessage(event) {
        event.preventDefault();
        const message = document.getElementById("messageInput").value.trim();

        if (message === "") {
            alert("Message cannot be empty!");
            return;
        }

        fetch("https://budgetbuilder.mooo.com/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        })
        .then(response => response.json())
        .then(data => {
            alert("Message Added: " + data.message);
            document.getElementById("messageInput").value = "";
            fetchMessages();
        })
        .catch(error => alert("Error: " + error));
    }

    // Update a message (AJAX PUT)
    function updateMessage(event) {
        event.preventDefault();
        const id = document.getElementById("updateId").value.trim();
        const message = document.getElementById("updateMessage").value.trim();

        if (id === "" || message === "") {
            alert("Both fields are required!");
            return;
        }

        fetch(`https://budgetbuilder.mooo.com/api/messages/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        })
        .then(response => response.json())
        .then(data => {
            alert("Message Updated: " + data.message);
            document.getElementById("updateId").value = "";
            document.getElementById("updateMessage").value = "";
            fetchMessages();
        })
        .catch(error => alert("Error: " + error));
    }

    // Delete a message (AJAX DELETE)
    function deleteMessage(event) {
        event.preventDefault();
        const id = document.getElementById("deleteId").value.trim();

        if (id === "") {
            alert("Message ID is required!");
            return;
        }

        fetch(`https://budgetbuilder.mooo.com/api/messages/${id}`, {
            method: "DELETE"
        })
        .then(response => response.json())
        .then(data => {
            alert("Message Deleted: " + data.success);
            document.getElementById("deleteId").value = "";
            fetchMessages();
        })
        .catch(error => alert("Error: " + error));
    }

    console.log("API event listeners attached successfully.");
});

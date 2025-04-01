document.addEventListener("DOMContentLoaded", function () {
    console.log(" Script loaded and running!");

    /** ---------------- Income & Expenses Section ---------------- **/

    let incomeItems = [];
    let expenseItems = [];

    function updateBudget() {
        let totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
        let totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
        let remainingBalance = totalIncome - totalExpenses;

        document.getElementById("total-income").innerText = `${totalIncome.toFixed(2)}`;
        document.getElementById("total-expenses").innerText = `${totalExpenses.toFixed(2)}`;
        document.getElementById("remaining-balance").innerText = `${remainingBalance.toFixed(2)}`;
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
    
    // This is your unauthenticated GET request for data.json
  fetch('data.json')
  .then(response => response.json())
  .then(data => {
    console.log("Data loaded via GET:", data);

    // Display something on the page
    const container = document.getElementById("public-data");
    container.innerHTML = `
      <p>${data.message}</p>
      <ul>
        ${data.items.map(item => `<li>${item.name}</li>`).join('')}
      </ul>
    `;
  })
  .catch(err => {
    console.error("Error fetching data.json:", err);
});    

function createNewItem(itemData) {
    fetch('https://budgetbuilder.mooo.com/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Replace 'admin:adminpassword' with your admin credentials.
        'Authorization': 'Basic ' + btoa('Iloverunning11@@')
      },
      body: JSON.stringify(itemData)
    })
      .then(response => response.json())
      .then(data => {
        console.log('Item created:', data);
        // Optionally, update your UI based on the response.
      })
      .catch(err => console.error('Error creating item:', err));
  }
  
  function editItem(itemId, updatedData) {
    fetch(`https://budgetbuilder.mooo.com/api/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('Iloverunning11@@')
      },
      body: JSON.stringify(updatedData)
    })
      .then(response => response.json())
      .then(data => {
        console.log(`Item ${itemId} updated:`, data);
        // Optionally update the UI with the new item details.
      })
      .catch(err => console.error('Error updating item:', err));
  }
  
  function deleteItem(itemId) {
    fetch(`https://budgetbuilder.mooo.com/api/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa('Iloverunning11@@')
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(`Item ${itemId} deleted:`, data);
        // Remove the item from the UI if needed.
      })
      .catch(err => console.error('Error deleting item:', err));
  }
  document.getElementById('createUserForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Gather form data
    const formData = new FormData(this);
    const data = {
      newUsername: formData.get('newUsername'),
      newPassword: formData.get('newPassword'),
      role: formData.get('role')
    };
  
    fetch('https://budgetbuilder.mooo.com/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Again, admin credentials are required to create a new user.
        'Authorization': 'Basic ' + btoa('Iloverunning11@@')
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('User creation failed');
        }
        return response.json();
      })
      .then(result => {
        document.getElementById('userMessage').innerText = result.message;
        console.log('User created:', result);
      })
      .catch(err => {
        document.getElementById('userMessage').innerText = err.message;
        console.error(err);
      });
  });
  
});

// server.js
const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',         
  user: 'nodeuser',  
  password: 'Iloverunning11',  
  database: 'budgetbuilder'  
});
const promisePool = pool.promise();

//////////////////////////////
// CRUD Endpoints for "items"
//////////////////////////////

// CREATE: Insert a new item into the 'items' table
app.post('/api/items', async (req, res) => {
  try {
    const { user_id, title, content } = req.body;
    const [result] = await promisePool.query(
      'INSERT INTO items (user_id, title, content) VALUES (?, ?, ?)',
      [user_id, title, content]
    );
    res.json({ id: result.insertId, user_id, title, content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// READ: Get all items from the 'items' table
app.get('/api/items', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM items');
    res.json({ items: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE: Update an item in the 'items' table by its ID
app.put('/api/items/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const { id } = req.params;
    const [result] = await promisePool.query(
      'UPDATE items SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.json({ updatedID: id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove an item from the 'items' table by its ID
app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await promisePool.query(
      'DELETE FROM items WHERE id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      res.json({ deletedID: id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

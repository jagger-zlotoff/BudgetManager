// server.js
const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Optional: explicitly serve index.html at the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'nodeuser',
  password: 'Iloverunning11',
  database: 'budgetbuilder'
});
const promisePool = pool.promise();

//////////////////////////////
// Setup SSE for Real-Time Updates
//////////////////////////////

// Array to hold connected SSE clients
let sseClients = [];

// SSE endpoint that keeps an HTTP connection open to push events
app.get('/events', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send an initial comment to keep the connection alive
  res.write(': connected\n\n');

  // Register this client with a unique id
  const clientId = Date.now();
  const newClient = { id: clientId, res, ip: req.ip };
  sseClients.push(newClient);
  console.log(`SSE client ${clientId} connected. Total: ${sseClients.length}`);

  // Remove the client when connection closes
  req.on('close', () => {
    console.log(`SSE client ${clientId} disconnected`);
    sseClients = sseClients.filter(client => client.id !== clientId);
  });
});

// Function to broadcast an event to all SSE clients.
// The event object should include an action (e.g., "create", "update", "delete"),
// the data for the event, and who modified it.
function broadcastEvent(event) {
  console.log("Broadcasting event:", event); // Debugging log
  sseClients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(event)}\n\n`);
  });
}

//////////////////////////////
// CRUD Endpoints for "items"
//////////////////////////////

// CREATE: Insert a new item into the 'items' table
app.post('/api/items', async (req, res) => {
  try {
    // Accept an optional "user" field for identification; fallback to req.ip
    const { user_id, title, content, user } = req.body;
    const [result] = await promisePool.query(
      'INSERT INTO items (user_id, title, content) VALUES (?, ?, ?)',
      [user_id, title, content]
    );
    const newItem = { id: result.insertId, user_id, title, content };
    
    console.log("POST /api/items - created new item:", newItem);
    // Broadcast the creation event
    broadcastEvent({ action: 'create', data: newItem, modifiedBy: user || req.ip });
    res.json(newItem);
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
    const { title, content, user } = req.body;
    const { id } = req.params;
    const [result] = await promisePool.query(
      'UPDATE items SET title = ?, content = ? WHERE id = ?',
      [title, content, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      const updatedItem = { id, title, content };
      console.log("PUT /api/items/:id - updating item:", updatedItem);
      // Broadcast the update event
      broadcastEvent({ action: 'update', data: updatedItem, modifiedBy: user || req.ip });
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
    const [result] = await promisePool.query('DELETE FROM items WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Item not found' });
    } else {
      console.log("DELETE /api/items/:id - deleting item with id:", id);
      // Broadcast the delete event
      broadcastEvent({ action: 'delete', data: { id }, modifiedBy: req.ip });
      res.json({ deletedID: id });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}\nAccess it at http://localhost:${PORT}`);
});

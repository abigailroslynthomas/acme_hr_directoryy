require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

// GET /api/employees - Fetch all employees
app.get('/api/employees', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM employees');
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/departments - Fetch all departments
app.get('/api/departments', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM departments');
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

// POST /api/employees - Create a new employee
app.post('/api/employees', async (req, res, next) => {
    try {
        const { name, department_id } = req.body;
        const result = await pool.query(
            'INSERT INTO employees (name, department_id) VALUES ($1, $2) RETURNING *',
            [name, department_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// DELETE /api/employees/:id - Delete an employee
app.delete('/api/employees/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM employees WHERE id = $1', [id]);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
});

// PUT /api/employees/:id - Update an employee
app.put('/api/employees/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, department_id } = req.body;
        const result = await pool.query(
            'UPDATE employees SET name = $1, department_id = $2 WHERE id = $3 RETURNING *',
            [name, department_id, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

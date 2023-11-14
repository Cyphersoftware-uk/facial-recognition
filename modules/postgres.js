const { Pool } = require('pg');

// Configure the PostgreSQL connection
const pool = new Pool({
    user: 'admin',
    host: 'node2.cyphersoftware.uk',
    database: 'users',
    password: 'q5qsRhshdj8f',
    port: 5432, // Adjust the port if necessary
});

// Function to insert a new user into the database
async function createUser(username, password) {
    const query = {
        text: 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *',
        values: [username, password],
    };

    const client = await pool.connect();
    try {
        const result = await client.query(query);
        return result.rows[0];
    } finally {
        client.release();
    }
}

// Function to retrieve all users from the database
async function getAllUsers() {
    const query = 'SELECT * FROM users';

    const client = await pool.connect();
    try {
        const result = await client.query(query);
        return result.rows;
    } finally {
        client.release();
    }
}


module.exports = {
    createUser,
    getAllUsers,
};


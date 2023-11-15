const { Pool } = require('pg');

// Configure the PostgreSQL connection
const pool = new Pool({
    user: 'facial',
    host: '45.87.28.51',
    database: 'facial_recognition',
    password: 'AVl2ZpOecNcJDQt',
    port: 5432, // Adjust the port if necessary
});



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

async function write_student_data(ID, Name) {
    const Fname = Name.split(" ")[0];
    const Lname = Name.split(" ")[1];
    var query = 'SELECT * FROM STUDENT_REG WHERE ID = $1';
    var values = [ID];

    const client = await pool.connect();

    try {
        const result = await client.query(query, values);
        if (result.rowCount === 1) {
            query = 'UPDATE STUDENT_REG SET Fname = $2, Lname = $3 WHERE ID = $1';
            values = [ID, Fname, Lname];
            const result = await client.query(query, values);
            console.log('Updated')
            return result;
        } else {
            query = 'INSERT INTO STUDENT_REG (ID, Fname, Lname) VALUES ($1, $2, $3)';
            values = [ID, Fname, Lname];
            const result = await client.query(query, values);
            console.log('Inserted')
            return result;
        }
    } finally {
        client.release();
    }

}

async function pull_all_reg_records() {
    const query = 'SELECT * FROM STUDENT_REG';
    const client = await pool.connect();
    try {
        const result = await client.query(query);
        return result.rows;
    } finally {
        client.release();
    }
}

async function attendance_record(ID, Location, present) {
    var query = 'SELECT * FROM STUDENT_LOCATION WHERE ID = $1';
    var values = [ID];

    const client = await pool.connect();

    try {
        const result = await client.query(query, values);
        if (result.rowCount === 1) {
            query = 'UPDATE STUDENT_LOCATION SET Location = $2, present = $3 WHERE ID = $1';
            values = [ID, Location, present];
            const result = await client.query(query, values);
            console.log('Updated')
            const name = await get_student_name(ID);
            return name;

        } else {
            query = 'INSERT INTO STUDENT_LOCATION (ID, Location, present) VALUES ($1, $2, $3)';
            values = [ID, Location, present];
            const result = await client.query(query, values);
            console.log('Inserted')
            // get name
            const name = await get_student_name(ID);
            return name;
        }
    } finally {
        client.release();
    }
}


async function get_student_count(location) {
    const query = 'SELECT * FROM STUDENT_LOCATION WHERE Location = $1 AND present = $2';
    const values = [location, true];
    const client = await pool.connect();
    try {
        const result = await client.query(query, values);
        console.log(JSON.stringify(result.rows));

        result.rows.forEach(async row => {
            console.log(await get_student_name(row.id));
        });

        return result.rowCount;
    } finally {
        client.release();
    }
}

async function get_student_name(ID) {

    console.log(ID)
    const query = 'SELECT * FROM STUDENT_REG WHERE ID = $1';
    const values = [ID];

    const client = await pool.connect();

    try {
        const result = await client.query(query, values);
        console.log(JSON.stringify(result.rows));
        return (result.rows[0].fname + " " + result.rows[0].lname)
    }
    finally {
        client.release();
    }
}

module.exports = {
    getAllUsers,
    pull_all_reg_records,
    write_student_data,
    attendance_record,
    get_student_count

};

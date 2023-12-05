const { Pool } = require('pg');

// Configure the PostgreSQL connection
const pool = new Pool({
    user: 'facial',
    host: '45.87.28.51',
    database: 'facial_recognition',
    password: 'AVl2ZpOecNcJDQt',
    port: 5432, // Adjust the port if necessary
});


async function wipe_shit_data() {
    const query = "DELETE FROM student_reg WHERE timestamp = 1701139264;"
    try {
        const res = await pool.query(query)
    } catch (e) {
        console.log(e)
    }
    
}

async function main() {
    wipe_shit_data()
}

main()
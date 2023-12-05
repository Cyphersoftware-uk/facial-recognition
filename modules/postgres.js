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
    const query = 'SELECT * FROM STUDENT_LOCATION';

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

            return result;
        } else {
            query = 'INSERT INTO STUDENT_REG (ID, Fname, Lname) VALUES ($1, $2, $3)';
            values = [ID, Fname, Lname];
            const result = await client.query(query, values);

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

            const name = await get_student_name(ID);
            return name;

        } else {
            query = 'INSERT INTO STUDENT_LOCATION (ID, Location, present) VALUES ($1, $2, $3)';
            values = [ID, Location, present];
            const result = await client.query(query, values);

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




        return result.rowCount;
    } finally {
        client.release();
    }
}

async function log_locations() {
    const query = 'SELECT * FROM STUDENT_LOCATION';
    const client = await pool.connect();

    try {
        const result = await client.query(query);
        return result.rows;
    } finally {
        client.release();
    }
}

async function get_student_name(ID) {

    const query = 'SELECT * FROM STUDENT_REG WHERE id = $1';
    const values = [ID];
   

    const client = await pool.connect();

    try {
        const result = await client.query(query, values);


        return (result.rows[0].fname + " " + result.rows[0].lname)
    }
    finally {
        client.release();
    }
}

async function search_data(id, location, timePeriodStart, timePeriodEnd) {
    let possible_matches = [];
    let query = 'SELECT * FROM STUDENT_LOCATION WHERE id = $1'
    let values = [];
    var reg = /^\d+$/;


    // IF NO ID OR LOCATION BUT TIME PERIOD IS PROVIDED
    if (!id && !location && timePeriodStart && timePeriodEnd) {
        query = 'SELECT * FROM STUDENT_LOCATION WHERE timestamp BETWEEN $1 AND $2';
        values.push(timePeriodStart, timePeriodEnd);

        const client = await pool.connect();

        try {
            const result = await client.query(query, values);
            if (result.rowCount === 0) {
                return {
                    "status": 200,
                    "data": []
                }
            }
            
            const array = [];

            for (let i = 0; i < result.rows.length; i++) {
                const name = await get_student_name(result.rows[i].id);
                array.push({
                    id: result.rows[i].id,
                    name: name,
                    location: result.rows[i].location,
                    present: result.rows[i].present,
                    timestamp: result.rows[i].timestamp
                })
            }

            return {
                "status": 200,
                "data": array
            }
        } catch (error) {
            console.log(error)
        }
        finally {
            client.release();
        }
    }

    // IF NO ID IS PROVIDED BUT LOCATION IS
    if (!id && location) {
        query = 'SELECT * FROM STUDENT_LOCATION WHERE location = $1';
        values.push(location);

        if (timePeriodStart && timePeriodEnd) {
            query += ' AND timestamp BETWEEN $2 AND $3';
            values.push(timePeriodStart, timePeriodEnd);
        }

        const client = await pool.connect();

        try {
            const result = await client.query(query, values);
            if (result.rowCount === 0) {
                return {
                    "status": 200,
                    "data": []
                }
            }
            
            const array = [];

            for (let i = 0; i < result.rows.length; i++) {
                const name = await get_student_name(result.rows[i].id);
                array.push({
                    id: result.rows[i].id,
                    name: name,
                    location: result.rows[i].location,
                    present: result.rows[i].present,
                    timestamp: result.rows[i].timestamp
                })
            }

            return {
                "status": 200,
                "data": array
            }
        } catch (error) {
            console.log(error)
        }
        finally {
            client.release();
        }
    }

    // IF PARAMS ARE NOT PROVIDED
    if (!id && !location && !timePeriodStart && !timePeriodEnd) {
        const data = await getAllUsers();
        if (data.length === 0) {
            return {
                "status": 200,
                "data": []
            }
        }
        const array = [];
        for (let i = 0; i < data.length; i++) {
            let name = await get_student_name(data[i].id);
            array.push({
                id: data[i].id,
                name: name,
                location: data[i].location,
                present: data[i].present,
                timestamp: data[i].timestamp
            })
        }
        return {
            "skip": true,
            "status": "Success",
            "data": array

        }

    }

    // IF ID IS NOT AN INTEGER
    if (!id.match(reg)) {

        id = id.toLowerCase();
        possible_matches = await name_to_id(id); // RETURNS ALL POSSIBLE MATCHES (ID, FNAME, LNAME)

        // IF NO MATCHES
        if (possible_matches.length === 0) {
            console.log('No matches')
            return {
                "status": 200,
                "data": []
            }
        }

        // IF ONLY 1 MATCH
        else if (possible_matches.length === 1) {
            console.log('Only 1 match')
            let new_id = possible_matches[0].id;
            values.push(new_id);

            if (location) {
                query += ' AND Location = $2';
                values.push(location);
            }

            if (timePeriodStart && timePeriodEnd && !location) {
                query += ' AND timestamp BETWEEN $2 AND $3';
                values.push(timePeriodStart, timePeriodEnd);
            }

            if (timePeriodStart && timePeriodEnd && location) {
                query += ' AND timestamp BETWEEN $3 AND $4';
                values.push(new_id, location, timePeriodStart, timePeriodEnd);
            }

            const client = await pool.connect();

            try {
                const result = await client.query(query, values);
                if (result.rowCount === 0) {
                    return {
                        "status": 200,
                        "data": [],
                        "skip": true,
                    }
                }

                const array = [];
                const name = await get_student_name(result.rows[0].id);
                array.push({
                    id: result.rows[0].id,
                    name: name,
                    location: result.rows[0].location,
                    present: result.rows[0].present,
                    timestamp: result.rows[0].timestamp
                })

                return {
                    "status": 200,
                    "data": array,
                    "skip": true,
                }
            } catch (error) {
                console.log(error)
            }
            finally {
                client.release();
            }



            // IF MULTIPLE MATCHES (2+)
        } else if (possible_matches.length > 1) {
            console.log('Multiple matches')
            console.log(possible_matches)
            console.log(location)
            let data_array = [];

            // LOOP THROUGH ALL POSSIBLE MATCHES
            for (let i = 0; i < possible_matches.length; i++) {
                query = 'SELECT * FROM STUDENT_LOCATION WHERE id = $1';
                values = [];
                let new_id = possible_matches[i].id;
                values.push(new_id);
                // IF LOCATION IS PROVIDED
                if (location) {
                    query += ' AND Location = $2';
                    values.push(location);
                }
                // IF TIME PERIOD IS PROVIDED
                if (timePeriodStart && timePeriodEnd && !location) {
                    query += ' AND timestamp BETWEEN $2 AND $3';
                    values.push((timePeriodStart), timePeriodEnd);
                }

                if (timePeriodStart && timePeriodEnd && location) {
                    query += ' AND timestamp BETWEEN $3 AND $4';
                    values.push(new_id, location, timePeriodStart, timePeriodEnd);
                }

                const client = await pool.connect();

                console.log(query.replace(/\$1/g, new_id).replace(/\$2/g, location).replace(/\$3/g, timePeriodStart).replace(/\$4/g, timePeriodEnd))
                
                const results = await client.query(query, values);

                if (results.rowCount === 0) {
                    continue;
                }
                console.log(results)
                
                const name = await get_student_name(results.rows[0].id);
                // PUSH DATA TO ARRAY TO CREATE ONE BIG ARRAY RATHER THEN 2
                data_array.push({
                    id: results.rows[0].id,
                    name: name,
                    location: results.rows[0].location,
                    present: results.rows[0].present,
                    timestamp: results.rows[0].timestamp
                })
            }

            console.log(data_array)
            return {
                "status": "Success",
                "data": data_array,
                "skip": true,
            }
        }
        // IF ID IS AN INTEGER (ONLY 1 MATCH)
    } else {
        values.push(id);
        // IF ID IS AN INTEGER & LOCATION IS PROVIDED
        if (location) {
            query += ' AND Location = $2';
            values.push(location);
        }

        // IF ID IS AN INTEGER & TIME PERIOD IS PROVIDED
        if (timePeriodStart && timePeriodEnd) {
            query += ' AND timestamp BETWEEN $3 AND $4';
            values.push(timePeriodStart, timePeriodEnd);
        }

        const client = await pool.connect();

        try {
            const result = await client.query(query, values);

            const array = [];
            
            for (let i = 0; i < result.rows.length; i++) {
                const name = await get_student_name(result.rows[i].id);
                array.push({
                    id: result.rows[i].id,
                    name: name,
                    location: result.rows[i].location,
                    present: result.rows[i].present,
                    timestamp: result.rows[i].timestamp
                })
            }

            return {
                "status": 200,
                "data": array
            }
        } catch (error) {
            console.log(error)
        }
        finally {
            client.release();
        }
    }
}

async function get_location(id) {
    const query = 'SELECT location FROM STUDENT_LOCATION WHERE ID = $1';
    const values = [id];

    const client = await pool.connect();

    try {
        const result = await client.query(query, values);
        return result.rows[0].location
    } catch (error) {
        console.log(error)
    }
    finally {
        client.release();
    }

}


async function name_to_id(name) {
    const query = 'SELECT * FROM STUDENT_REG WHERE fname = $1';
    const values = [name];

    const client = await pool.connect();

    try {
        const result = await client.query(query, values);
        return result.rows
    }
    finally {
        client.release();
    }
}



const pool2 = new Pool({
    user: 'facial',
    host: '45.87.28.51',
    database: 'LOGIN_DB',
    password: 'AVl2ZpOecNcJDQt',
    port: 5432, // Adjust the port if necessary
}); 


async function register_admin(username, password) {
    const query = 'INSERT INTO login_creds (username, password) VALUES ($1, $2)';
    const values = [username, password];

    const client = await pool2.connect();

    try {
        const result = await client.query(query, values);
        
        if (result.rowCount === 1) {
            return {
                "status": 200,
                "message": "Success"
            }
        } else {
            return {
                "status": 400,
                "message": "Failure"
            }
        }
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
    get_student_count,
    log_locations,
    search_data,
    get_student_name,
    name_to_id,
    register_admin

};

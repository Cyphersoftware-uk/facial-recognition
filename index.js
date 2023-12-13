const express = require('express');
const { join } = require('path');
const cors = require('cors');
const fs = require('fs');
const exec = require('child_process').exec;

const delay = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const swaggerstats = require('swagger-stats');




const app = express();
const port = 5000;

const { getAllUsers, pull_all_reg_records, write_student_data, attendance_record, get_student_count, log_locations, search_data, name_to_id, get_student_name, register_admin } = require('./modules/postgres.js');
const { authenticate } = require('./modules/authentication.js');
const { execSync } = require('child_process');


app.use(cors());
app.use(swaggerstats.getMiddleware({
    uriPath: '/dev/stats',
}));

app.post('/attendance', async (req, res) => {


    let ID = req.query.id
    let Location = req.query.Location;
    let present = req.query.present;

    console.log(`ID: ${ID}, Location: ${Location}, present: ${present}`)
    

    const result = await attendance_record(ID, Location, present);

    if (result !== undefined) {
        res.status(200).send({

            "status": "Success",
            "name": result
        });
    } else {
        res.status(400).send("Failure");
    }
});

app.get('/data', async (req, res) => {
    const result = await log_locations();

    if (result !== undefined) {
        res.status(200).jsonp({

            "status": "Success",
            "data": result
        });
    } else {
        res.status(400).send("Failure");
    }
})

app.get('/', (req, res) => {
    res.status(200).jsonp({
        "status": 200,
        "message": "This endpoint is not supported"
    });
})

app.post('/register', async (req, res) => {
    const ID = req.query.ID;
    const Name = req.query.Name;

    const result = await write_student_data(ID, Name);

    if (result.rowCount === 1) {
        res.status(200).send({

            "status": "Success",
            "name": result

        })
    } else {
        res.status(400).send("Failure");
    }
})

app.get('/student_count', async (req, res) => {
    const location = req.query.Location;

    const result = await get_student_count(location);

    if (result !== undefined) {
        res.status(200).send({

            "status": "Success",
            "count": result
        });
    } else {
        res.status(400).send("Failure");
    }
})


app.get('/search_attendance', async (req, res) => {

    

    let { studentName, Location, timePeriodStart, timePeriodEnd } = req.query;

    console.log(`studentName: ${studentName}, Location: ${Location}, timePeriodStart: ${timePeriodStart}, timePeriodEnd: ${timePeriodEnd}`)

    try {

        if (Location !== undefined) {
            Location = Location.toLowerCase();
        } 
        const result = await search_data(studentName, Location, timePeriodStart, timePeriodEnd);
        if (res.status === 500) {
            res.status(500).send("Failure");
        } else {
            res.status(200).send({
                "status": result.status,
                "data": result.data
            });
        } 
    }
    catch (error) {
        console.log(error)
    }
});



app.post('/Admin_Register', async (req, res) => {

    console.log(req.url)
    const Name = req.query.Username;
    const Password = req.query.Password;

    console.log(Name, Password)
    const result = await register_admin(Name, Password);

    if (result.status === 200) {
        res.status(200).send({

            "status": 200,
            "name": result

        })
    } else {
        res.status(400).send("Failure");
    }
})


app.listen(port, async() => {
    const logo = fs.readFileSync(join(__dirname, 'data/assets/ascii_logo.txt'), 'utf8');
    console.log(logo);
    console.log(`Listening for Requests on 0.0.0.0:${port}`)
});
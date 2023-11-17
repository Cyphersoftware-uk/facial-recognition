const express = require('express');
const { join } = require('path');


const swaggerstats = require('swagger-stats');
const swagger_ui = require('swagger-ui-express');

const app = express();
const port = 5000;

const { getAllUsers, pull_all_reg_records, write_student_data, attendance_record, get_student_count, log_locations } = require('./modules/postgres.js');
const { authenticate } = require('./modules/authentication.js');





app.get('/attendance', async (req, res) => {

    console.log(req.url)
    const ID = req.query.ID;
    const Location = req.query.Location;
    const present = req.query.present;

    console.log(ID, Location, present);

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
        res.status(200).send({

            "status": "Success",
            "name": result
        });
    } else {
        res.status(400).send("Failure");
    }
})

app.get('/register', async (req, res ) => {
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


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
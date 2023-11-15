const express = require('express');
const { join } = require('path');


const swaggerstats = require('swagger-stats');
const swagger_ui = require('swagger-ui-express');

const app = express();
const port = 5000;

const { getAllUsers, pull_all_reg_records, write_student_data, attendance_record } = require('./modules/postgres.js');
const { authenticate } = require('./modules/authentication.js');




app.get('/attendance', async (req, res) => {
    const ID = req.query.ID;
    const Location = req.query.Location;
    const present = req.query.present;

    console.log(ID, Location, present);

    const result = await attendance_record(ID, Location, present);
    
    if (result.rowCount === 1) {
        res.status(200).send("Success");
    } else {
        res.status(400).send("Failure");
    }
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
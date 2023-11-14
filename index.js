const express = require('express');
const { join } = require('path');


const swaggerstats = require('swagger-stats');
const swagger_ui = require('swagger-ui-express');

const app = express();
const port = 3000;

const { init_db, write_dummy_data, read_dummy_data } = require('./modules/postgres.js');
const { authenticate } = require('./modules/authentication.js');




app.get('/api/view_stats', (req, res) => {
    
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
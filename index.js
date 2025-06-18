const express = require('express');
const { sequelize } = require('./src/db/db');
const app = express();

async function start() {
    try {
        await sequelize.authenticate();
        console.log('Connection established');


        await sequelize.sync();
        console.log('Models synchronized');

        app.listen(3000, () => {
            console.log('Server started on port 3000');
        });
    } catch (error) {
        console.error('Initialization error:', error);
        process.exit(1);
    }
}

start();
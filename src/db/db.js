const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres'});


const User = require('./models/User')(sequelize, DataTypes);
const Project = require('./models/Project')(sequelize, DataTypes);
const Task = require('./models/Task')(sequelize, DataTypes);


module.exports = {
        sequelize,
        User,
        Project,
        Task
};
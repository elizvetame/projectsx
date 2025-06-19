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


const User = require('../db/models/User')(sequelize, DataTypes);
const Project = require('../db/models/Project')(sequelize, DataTypes);
const Task = require('../db/models/Task')(sequelize, DataTypes);
const ProjectMember = require('../db/models/ProjectMember')(sequelize, DataTypes);

ProjectMember.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(ProjectMember, { foreignKey: 'user_id' });

module.exports = {
        sequelize,
        User,
        Project,
        Task,
        ProjectMember
};
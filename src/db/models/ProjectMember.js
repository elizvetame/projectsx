const { DataTypes } = require('sequelize');
const {Project, User} = require("../../config/db");

module.exports = (sequelize) => {
    const ProjectMember = sequelize.define(
        'projectMembers',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            project_id : {
                type: DataTypes.INTEGER,
                references: { model: 'projects', key: 'id' }
            },
            user_id: {
                type: DataTypes.INTEGER,
                references: { model: 'users', key: 'id' }
            },
        });


    return ProjectMember;
};



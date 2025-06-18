const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    const Project = sequelize.define(
        'project',
        {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        }
    });

    Project.associate = (models) => {
        Project.belongsToMany(models.User, { through: 'ProjectMembers' });
        Project.hasMany(models.Task);
    };

    return Project;
};
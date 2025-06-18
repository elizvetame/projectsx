const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Task = sequelize.define(
        'task',
        {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.ENUM('todo', 'in_progress', 'done'),
            defaultValue: 'todo'
        }
    });

    Task.associate = (models) => {
        Task.belongsTo(models.Project);
        Task.belongsTo(models.User, { as: 'assignee' });
    };

    return Task;
};
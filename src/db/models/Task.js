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
        },
        project_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'projects',
                    key: 'id'
                }
        },
       assignee_id: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
        }
    });

    Task.associate = (models) => {
        Task.belongsTo(models.Project, { foreignKey: 'project_id' });
        Task.belongsTo(models.User, { foreignKey: 'assignee_id' });
    };


    return Task;
};
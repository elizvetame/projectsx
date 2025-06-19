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
        },
        created_by: {
                type: DataTypes.INTEGER,
                references: {
                    model: 'users',
                    key: 'id'
                }
        }
    });

    Project.associate = (models) => {
        Project.belongsToMany(models.User, {
            through: 'ProjectMembers', // Указываем точное имя таблицы
            foreignKey: 'project_id',
            otherKey: 'user_id'
        });
        Project.hasMany(models.Task);
    };

    return Project;
};
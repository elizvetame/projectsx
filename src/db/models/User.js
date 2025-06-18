const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('manager', 'team_lead', 'developer'),
            allowNull: false
        }
    }, {
        timestamps: false,
        tableName: 'users'
    });

    User.associate = ({ Project, Task }) => {
        User.belongsToMany(Project, { through: 'ProjectMembers' });
        User.hasMany(Task, { foreignKey: 'assigneeId' });
    };

    return User;
};
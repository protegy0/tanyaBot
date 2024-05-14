module.exports = (sequelize, DataTypes) => {
    return sequelize.define('users', {
        user_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        balance: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        gems: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        time_since_daily: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        time_since_steal: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        experience: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false
        }

    }, {
        timestamps: false,
    });
};
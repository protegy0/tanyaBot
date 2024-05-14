module.exports = (sequelize, DataTypes) => {
    return sequelize.define('find_database', {
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        timestamps: false,
    });
};
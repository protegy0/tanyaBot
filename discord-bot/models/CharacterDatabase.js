module.exports = (sequelize, DataTypes) => {
    return sequelize.define('character_database', {
        name: {
            type: DataTypes.STRING,
            unique: true,
        },
        image_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: false,
    });
};
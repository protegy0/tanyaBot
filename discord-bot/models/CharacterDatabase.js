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
        owner: {
            type: DataTypes.STRING,
            defaultValue: '0',
            allowNull: false,
        },
    }, {
        timestamps: false,
    });
};


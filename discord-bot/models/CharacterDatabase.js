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
        experience: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        level: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        attack: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        defense: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        health: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
            allowNull: false,
        },
        speed: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        statpoints: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    }, {
        timestamps: false,
    });
};


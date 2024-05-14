module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user_finds', {
        user_id: DataTypes.STRING,
        find_id: DataTypes.INTEGER,
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            'default': 0,

        },
    }, {
        timestamps: false,
    });
};
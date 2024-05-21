module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user_characters', {
        user_id: DataTypes.STRING,
        character_id: DataTypes.INTEGER,
        amount: DataTypes.INTEGER,
    }, {
        timestamps: false,
    });
};
const Sequelize = require('sequelize');


const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const CurrencyShop = require('./models/CurrencyShop.js')(sequelize, Sequelize.DataTypes);
const UserItems = require('./models/UserItems.js')(sequelize, Sequelize.DataTypes);
const UserFinds = require('./models/UserFinds.js')(sequelize, Sequelize.DataTypes);
const FindDatabase = require('./models/FindDatabase.js')(sequelize, Sequelize.DataTypes)
const GemShop = require('./models/GemShop.js')(sequelize, Sequelize.DataTypes);
const UserCharacters = require('./models/UserCharacters.js')(sequelize, Sequelize.DataTypes);
const CharacterDatabase = require('./models/CharacterDatabase.js')(sequelize, Sequelize.DataTypes);

UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as: 'item' });
UserItems.belongsTo(GemShop, { foreignKey: 'item_id', as: 'gemItem' });
UserFinds.belongsTo(FindDatabase, { foreignKey: 'find_id', as: 'find'});
UserCharacters.belongsTo(CharacterDatabase, { foreignKey: 'character_id', as: 'character' });

Reflect.defineProperty(Users.prototype, 'addItem', {
    value: async function addItem(item) {
        const userItem = await UserItems.findOne({
            where: { user_id: this.user_id, item_id: item.id },
        });

        if (userItem) {
            userItem.amount += 1;
            return userItem.save();
        }

        return UserItems.create({ user_id: this.user_id, item_id: item.id, amount: 1 });
    },
});
Reflect.defineProperty(Users.prototype, 'addFind', {
    value: async function addFind(find) {
        const userFind = await UserFinds.findOne({
            where: { user_id: this.user_id, find_id: find.id },
        });

        if (userFind) {
            userFind.amount += 1;
            return userFind.save();
        }

        return UserFinds.create({ user_id: this.user_id, find_id: find.id, amount: 1 });
    },
});

Reflect.defineProperty(Users.prototype, 'removeItem', {

    value: async function removeItem(item) {
        const userItem = await UserItems.findOne({
            where: { user_id: this.user_id, item_id: item.id },
        });
        if (!userItem || (userItem.amount === 0)) {
            return -1
        } else {
            userItem.amount -= 1;
            return userItem.save()
        }


    },
});

Reflect.defineProperty(Users.prototype, 'removeCharacter', {
    value: async function removeCharacter(character) {
        const userCharacter = await UserCharacters.findOne({
            where: { user_id: this.user_id, character_id: character.id },
        });
        if (!userCharacter) {
            return -1
        } else {
            userCharacter.destroy()
            return userCharacter.save();
        }
    },
});

Reflect.defineProperty(Users.prototype, 'addCharacter', {
    value: async function addCharacter(character) {
        const userCharacter = await UserCharacters.findOne({
            where: { user_id: this.user_id, character_id: character.id },
        });

        if (userCharacter) {
            return -1
        }

        return UserCharacters.create({ user_id: this.user_id, character_id: character.id });
    },
});

Reflect.defineProperty(Users.prototype, 'getItems', {
    value: function getItems() {
        return UserItems.findAll({
            where: { user_id: this.user_id },
            include: ['item', 'gemItem'],
        });
    },
});
Reflect.defineProperty(Users.prototype, 'getFinds', {
    value: function getFinds() {
        return UserFinds.findAll({
            where: { user_id: this.user_id },
            include: ['find'],
        });
    },
});

module.exports = { Users, CurrencyShop, UserItems, FindDatabase, GemShop, CharacterDatabase, UserCharacters };
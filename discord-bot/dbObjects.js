const Sequelize = require('sequelize');

/*
 * Make sure you are on at least version 5 of Sequelize! Version 4 as used in this guide will pose a security threat.
 * You can read more about this issue on the [Sequelize issue tracker](https://github.com/sequelize/sequelize/issues/7310).
 */

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

UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as: 'item' });
UserItems.belongsTo(GemShop, { foreignKey: 'item_id', as: 'gemItem' });
UserFinds.belongsTo(FindDatabase, { foreignKey: 'find_id', as: 'find'});

Reflect.defineProperty(Users.prototype, 'addItem', {
    /* eslint-disable-next-line func-name-matching */
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
    /* eslint-disable-next-line func-name-matching */
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

Reflect.defineProperty(Users.prototype, 'getItems', {
    /* eslint-disable-next-line func-name-matching */
    value: function getItems() {
        return UserItems.findAll({
            where: { user_id: this.user_id },
            include: ['item', 'gemItem'],
        });
    },
});
Reflect.defineProperty(Users.prototype, 'getFinds', {
    /* eslint-disable-next-line func-name-matching */
    value: function getFinds() {
        return UserFinds.findAll({
            where: { user_id: this.user_id },
            include: ['find'],
        });
    },
});

module.exports = { Users, CurrencyShop, UserItems, FindDatabase, GemShop };
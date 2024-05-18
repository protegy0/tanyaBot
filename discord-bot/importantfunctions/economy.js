const {Users} = require("../dbObjects");
const {Collection} = require("discord.js");
const userInfo = new Collection();
(async () => {
    const storedUserInfo = await Users.findAll();
    storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
})();




const economy = {
    addBalance: async function (id, amount) {
        const user = userInfo.get(id);
        if (user) {
            user.balance += Number(amount);
            return user.save();
        }
        const newUser = await Users.create({user_id: id, balance: amount});
        userInfo.set(id, newUser);
        return newUser;
    },

    addExp: async function (id, amount) {
        const user = userInfo.get(id);
        if (user) {
            user.experience += Number(amount);
            return user.save();
        }
        const newUser = await Users.create({user_id: id, experience: amount});
        userInfo.set(id, newUser);
        return newUser;
    },

    addGems: async function (id, amount) {
        const user = userInfo.get(id);
        if (user) {
            user.gems += Number(amount);
            return user.save();
        }
        const newUser = await Users.create({user_id: id, gems: amount});
        userInfo.set(id, newUser);
        return newUser;
    },

    increaseLevel: async function (id) {
        const user = userInfo.get(id);
        if (user) {
            user.level += 1;
            return user.save();
        }
        const newUser = await Users.create({user_id: id, level: 1});
        userInfo.set(id, newUser);
        return newUser;
    },

    calcLevel: function (experience) {
        let level = 1
        while ((experience > (100 * level) ** 1.1)) {
            level += 1
        }
        return level
    },

    getExp: function (id) {
        const user = userInfo.get(id);
        return user ? user.experience : 0;
    },

    getLevel: function (id) {
        const user = userInfo.get(id);
        return user ? user.level : 1;
    },

    getGems: function (id) {
        const user = userInfo.get(id);
        return user ? user.gems : 1;
    },

    getBalance: function (id) {
        const user = userInfo.get(id);
        return user ? user.balance : 0;
    },

    setDailyTime: async function (id) {
        const user = userInfo.get(id);

        if (user) {
            user.time_since_daily = Date.now()
            return user.save();
        }
    },

    getDailyTimes: function(id) {
        const user = userInfo.get(id);
        return user ? user.time_since_daily : 0;
    },

    setStealTime: async function(id) {
        const user = userInfo.get(id);

        if (user) {
            user.time_since_steal = Date.now()
            return user.save();
        }
    },

    getStealTimes: function(id) {
        const user = userInfo.get(id);
        return user ? user.time_since_steal : 0;
    }

}

module.exports = economy;
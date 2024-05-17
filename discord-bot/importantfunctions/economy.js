const {Users} = require("../dbObjects");
const economy = {
    addBalance : async function(id, amount, userInfo) {
        const user = userInfo.get(id);
        if (user) {
            user.balance += Number(amount);
            return user.save();
        }
        const newUser = await Users.create({ user_id: id, balance: amount });
        userInfo.set(id, newUser);
        return newUser;
    },

    addExp : async function(id, amount, userInfo) {
        const user = userInfo.get(id);
        if (user) {
            user.experience += Number(amount);
            return user.save();
        }
        const newUser = await Users.create({ user_id: id, experience: amount });
        userInfo.set(id, newUser);
        return newUser;
    },

    addGems : async function(id, amount, userInfo) {
        const user = userInfo.get(id);
        if (user) {
            user.gems += Number(amount);
            return user.save();
        }
        const newUser = await Users.create({ user_id: id, gems: amount });
        userInfo.set(id, newUser);
        return newUser;
    },

    increaseLevel : async function(id, userInfo) {
        const user = userInfo.get(id);
        if (user) {
            user.level += 1;
            return user.save();
        }
        const newUser = await Users.create({ user_id: id, level: 1 });
        userInfo.set(id, newUser);
        return newUser;
    },

    calcLevel : function(experience) {
        let level = 1
        while ((experience > (100 * level)**1.1)) {
            level += 1
        }
        return level
    },

    getExp : function(id, userInfo) {
        const user = userInfo.get(id);
        return user ? user.experience : 0;
    },

    getLevel : function(id, userInfo) {
        const user = userInfo.get(id);
        return user ? user.level : 1;
    }

}

module.exports = economy;
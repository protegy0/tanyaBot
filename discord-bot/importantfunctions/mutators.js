const {Users} = require("../dbObjects");
const {Collection} = require("discord.js");
const userInfo = new Collection();
(async () => {
    const storedUserInfo = await Users.findAll();
    storedUserInfo.forEach(b => userInfo.set(b.user_id, b));
})();




const balance = {
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
    getBalance: function (id) {
        const user = userInfo.get(id);
        return user ? user.balance : 0;
    },
}

const exp = {
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
    getExp: function (id) {
        const user = userInfo.get(id);
        return user ? user.experience : 0;
    },
}

const gems = {
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
    getGems: function (id) {
        const user = userInfo.get(id);
        return user ? user.gems : 1;
    },
}

const level= {
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



    getLevel: function (id) {
        const user = userInfo.get(id);
        return user ? user.level : 1;
    },
}

const dailyTime = {
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
}

const stealTime = {
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
    },
}

const inviteTime = {
    setInviteTime: async function(id) {
        const user = userInfo.get(id);

        if (user) {
            user.time_since_invite = Date.now()
            return user.save();
        }
    },

    getInviteTimes: function(id) {
        const user = userInfo.get(id);
        return user ? user.time_since_invite : 0;
    },

    giveInvite: async function(id) {
        const user = userInfo.get(id);
        if (user) {
            user.time_since_invite = 0
            return user.save()
        }
    }
}




const workTime = {
    setWorkTime: async function(id) {
        const user = userInfo.get(id);
        if (user) {
            user.time_since_work = Date.now()
            return user.save();
        }
    },

    getWorkTimes: function(id) {
        const user = userInfo.get(id);
        return user ? user.time_since_work : 0;
    }
}

const workExp = {
    addWorkExp: async function(id, amount) {
        const user = userInfo.get(id);
        if (user) {
            user.work_experience += Number(amount);
            return user.save();
        }
        const newUser = await Users.create({user_id: id, work_experience: amount});
        userInfo.set(id, newUser);
        return newUser;
    },

    getWorkExp: function(id) {
        const user = userInfo.get(id);
        return user ? user.work_experience : 0;
    }
}

const job = {
    setJob: async function(id, jobName) {
        const user = userInfo.get(id);
        if (user) {
            user.current_job = jobName;
            return user.save();
        }
        const newUser = await Users.create({user_id: id, current_job: jobName});
        userInfo.set(id, newUser);
        return newUser;
    },

    getJob: function(id) {
        const user = userInfo.get(id);
        return user ? user.current_job : 'unemployed';
    }
}

const battleStats = {
    addWin: async function(id) {
        const user = userInfo.get(id);
        if (user) {
            user.battles_won += 1;
            return user.save();
        }
        const newUser = await Users.create({user_id: id, battles_won: 1});
        userInfo.set(id, newUser);
        return newUser;
    },

    addLoss: async function(id) {
        const user = userInfo.get(id);
        if (user) {
            user.battles_lost += 1;
            return user.save();
        }
        const newUser = await Users.create({user_id: id, battles_lost: 1});
        userInfo.set(id, newUser);
        return newUser;
    },

    getWins: function(id) {
        const user = userInfo.get(id);
        return user ? user.battles_won : 0;
    },

    getLosses: function(id) {
        const user = userInfo.get(id);
        return user ? user.battles_lost : 0;
    },

    getWinRate: function(id) {
        const wins = this.getWins(id);
        const losses = this.getLosses(id);
        const total = wins + losses;
        return total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
    }
}

const battleTime = {
    setBattleTime: async function(id) {
        const user = userInfo.get(id);
        if (user) {
            user.time_since_battle = Date.now();
            return user.save();
        }
    },

    getBattleTimes: function(id) {
        const user = userInfo.get(id);
        return user ? user.time_since_battle : 0;
    }
}

module.exports = { balance, exp, gems, dailyTime, stealTime, level, inviteTime, workTime, workExp, job, battleStats, battleTime };
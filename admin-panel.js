const express = require('express');
const path = require('path');

// Initialize database first
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: './discord-bot/database.sqlite',
    dialectOptions: {
        options: 'PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;'
    }
});

// Import models manually to avoid circular dependency issues
const Users = require('./discord-bot/models/Users.js')(sequelize, Sequelize.DataTypes);
const CurrencyShop = require('./discord-bot/models/CurrencyShop.js')(sequelize, Sequelize.DataTypes);
const UserItems = require('./discord-bot/models/UserItems.js')(sequelize, Sequelize.DataTypes);

// Setup relationships
UserItems.belongsTo(CurrencyShop, { foreignKey: 'item_id', as: 'item' });

// Initialize database
sequelize.sync().then(() => {
    console.log('📦 Database connected for admin panel');
}).catch(err => {
    console.error('❌ Database connection failed:', err.message);
});

// Create simplified mutators for admin panel
const balance = {
    addBalance: async function (id, amount) {
        const [user] = await Users.findOrCreate({ 
            where: { user_id: id },
            defaults: { user_id: id, balance: 0 }
        });
        user.balance += Number(amount);
        await user.save();
        return user;
    },
    getBalance: async function (id) {
        const user = await Users.findOne({ where: { user_id: id } });
        return user ? user.balance : 0;
    }
};

const gems = {
    addGems: async function (id, amount) {
        const [user] = await Users.findOrCreate({ 
            where: { user_id: id },
            defaults: { user_id: id, gems: 0 }
        });
        user.gems += Number(amount);
        await user.save();
        return user;
    },
    getGems: async function (id) {
        const user = await Users.findOne({ where: { user_id: id } });
        return user ? user.gems : 0;
    }
};

const exp = {
    addExp: async function (id, amount) {
        const [user] = await Users.findOrCreate({ 
            where: { user_id: id },
            defaults: { user_id: id, experience: 0 }
        });
        user.experience += Number(amount);
        await user.save();
        return user;
    },
    getExp: async function (id) {
        const user = await Users.findOne({ where: { user_id: id } });
        return user ? user.experience : 0;
    }
};

const level = {
    calcLevel: function (experience) {
        let level = 1;
        while ((experience > (100 * level) ** 1.1)) {
            level += 1;
        }
        return level;
    }
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Basic HTML template
const adminHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>TanyaBot Admin Panel</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #2c2f33; color: white; }
        .container { max-width: 800px; margin: 0 auto; }
        .section { background: #36393f; padding: 20px; margin: 20px 0; border-radius: 8px; }
        input, select, textarea { padding: 8px; margin: 5px; border: none; border-radius: 4px; }
        button { background: #7289da; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #5b6eae; }
        .result { background: #40444b; padding: 10px; margin: 10px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 TanyaBot Admin Panel</h1>
        
        <div class="section">
            <h2>💰 User Currency Management</h2>
            <input type="text" id="userId" placeholder="Discord User ID">
            <input type="number" id="amount" placeholder="Amount">
            <button onclick="addBalance()">Add Balance</button>
            <button onclick="addGems()">Add Gems</button>
            <button onclick="addExp()">Add EXP</button>
            <button onclick="getUserInfo()">Get User Info</button>
            <div id="userResult" class="result"></div>
        </div>

        <div class="section">
            <h2>📢 Send Messages</h2>
            <input type="text" id="channelId" placeholder="Channel ID">
            <textarea id="message" placeholder="Message to send" rows="3" style="width: 100%;"></textarea>
            <button onclick="sendMessage()">Send Message</button>
            <div id="messageResult" class="result"></div>
        </div>

        <div class="section">
            <h2>📊 Bot Statistics</h2>
            <button onclick="getBotStats()">Refresh Stats</button>
            <div id="statsResult" class="result"></div>
        </div>

        <div class="section">
            <h2>🗄️ Database Operations</h2>
            <button onclick="getAllUsers()">List All Users</button>
            <button onclick="getShopItems()">List Shop Items</button>
            <div id="dbResult" class="result"></div>
        </div>
    </div>

    <script>
        async function addBalance() {
            const userId = document.getElementById('userId').value;
            const amount = document.getElementById('amount').value;
            const response = await fetch('/api/user/balance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount: parseInt(amount) })
            });
            const result = await response.json();
            document.getElementById('userResult').innerHTML = JSON.stringify(result, null, 2);
        }

        async function addGems() {
            const userId = document.getElementById('userId').value;
            const amount = document.getElementById('amount').value;
            const response = await fetch('/api/user/gems', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount: parseInt(amount) })
            });
            const result = await response.json();
            document.getElementById('userResult').innerHTML = JSON.stringify(result, null, 2);
        }

        async function addExp() {
            const userId = document.getElementById('userId').value;
            const amount = document.getElementById('amount').value;
            const response = await fetch('/api/user/exp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount: parseInt(amount) })
            });
            const result = await response.json();
            document.getElementById('userResult').innerHTML = JSON.stringify(result, null, 2);
        }

        async function getUserInfo() {
            const userId = document.getElementById('userId').value;
            const response = await fetch(\`/api/user/\${userId}\`);
            const result = await response.json();
            document.getElementById('userResult').innerHTML = JSON.stringify(result, null, 2);
        }

        async function sendMessage() {
            const channelId = document.getElementById('channelId').value;
            const message = document.getElementById('message').value;
            const response = await fetch('/api/message/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channelId, message })
            });
            const result = await response.json();
            document.getElementById('messageResult').innerHTML = JSON.stringify(result, null, 2);
        }

        async function getBotStats() {
            const response = await fetch('/api/bot/stats');
            const result = await response.json();
            document.getElementById('statsResult').innerHTML = JSON.stringify(result, null, 2);
        }

        async function getAllUsers() {
            const response = await fetch('/api/users/all');
            const result = await response.json();
            document.getElementById('dbResult').innerHTML = JSON.stringify(result, null, 2);
        }

        async function getShopItems() {
            const response = await fetch('/api/shop/items');
            const result = await response.json();
            document.getElementById('dbResult').innerHTML = JSON.stringify(result, null, 2);
        }
    </script>
</body>
</html>
`;

// Serve the admin panel
app.get('/', (req, res) => {
    res.send(adminHTML);
});

// API Routes
app.post('/api/user/balance', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        await balance.addBalance(userId, amount);
        const userBalance = await balance.getBalance(userId);
        res.json({ success: true, userId, newBalance: userBalance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/user/gems', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        await gems.addGems(userId, amount);
        const userGems = await gems.getGems(userId);
        res.json({ success: true, userId, newGems: userGems });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/user/exp', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        await exp.addExp(userId, amount);
        const userExp = await exp.getExp(userId);
        const userLevel = level.calcLevel(userExp);
        res.json({ success: true, userId, newExp: userExp, calculatedLevel: userLevel });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/user/:userId', async (req, res) => {
    try {
        const user = await Users.findOne({ where: { user_id: req.params.userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/message/send', async (req, res) => {
    try {
        const { channelId, message } = req.body;
        // You'll need to pass the Discord client to this file
        // For now, this is a placeholder
        res.json({ success: true, message: 'Feature requires Discord client integration' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/bot/stats', async (req, res) => {
    try {
        const totalUsers = await Users.count();
        const totalBalance = await Users.sum('balance') || 0;
        const totalGems = await Users.sum('gems') || 0;
        
        // Calculate average level manually since some DBs don't support avg
        const users = await Users.findAll({ attributes: ['level'] });
        const avgLevel = users.length > 0 
            ? users.reduce((sum, u) => sum + u.level, 0) / users.length 
            : 0;
        
        res.json({
            totalUsers,
            totalBalance,
            totalGems,
            avgLevel: Math.round(avgLevel * 100) / 100
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users/all', async (req, res) => {
    try {
        const users = await Users.findAll({ limit: 50 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/shop/items', async (req, res) => {
    try {
        const currencyItems = await CurrencyShop.findAll();
        res.json({ currencyShop: currencyItems });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = { app };

// Start server if run directly
if (require.main === module) {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`🎛️  Admin panel running at http://localhost:${PORT}`);
    });
}
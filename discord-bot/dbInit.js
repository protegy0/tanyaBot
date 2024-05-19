const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const CurrencyShop = require('./models/CurrencyShop.js')(sequelize, Sequelize.DataTypes);
require('./models/Users.js')(sequelize, Sequelize.DataTypes);
require('./models/UserItems.js')(sequelize, Sequelize.DataTypes);

const FindDatabase = require('./models/FindDatabase.js')(sequelize, Sequelize.DataTypes);
require('./models/Users.js')(sequelize, Sequelize.DataTypes);
require('./models/UserFinds.js')(sequelize, Sequelize.DataTypes);

const GemShop = require('./models/GemShop.js')(sequelize, Sequelize.DataTypes);
require('./models/Users.js')(sequelize, Sequelize.DataTypes);
require('./models/UserItems.js')(sequelize, Sequelize.DataTypes);

const CharacterDatabase = require('./models/CharacterDatabase.js')(sequelize, Sequelize.DataTypes);
require('./models/Users.js')(sequelize, Sequelize.DataTypes);
require('./models/UserCharacters.js')(sequelize, Sequelize.DataTypes);



const force = process.argv.includes('--force') || process.argv.includes('-f');
const alter = process.argv.includes('--alter') || process.argv.includes('-a');

sequelize.sync({ force, alter }).then(async () => {
    const shop = [
        CurrencyShop.upsert({name: 'Dirty Bait', cost: 7, id: 1 }),
        CurrencyShop.upsert({name: 'Clean Bait', cost: 12, id: 2}),
        CurrencyShop.upsert({name: 'Great Bait', cost: 18, id: 3 }),
        CurrencyShop.upsert({name: 'Custom Role Color', cost: 500_000, id: 4 }),
        CurrencyShop.upsert({name: 'Protegy Voice Memo', cost: 3_000_000, id: 5 }),
        CurrencyShop.upsert({name: 'Ernie Voice Memo', cost: 10_000_000, id: 6 }),

    ];

    const finds = [
        FindDatabase.upsert({name: '💩', value: 1}),
        FindDatabase.upsert({name: 'Glass Shards', value: 2}),
        FindDatabase.upsert({name: 'Hard Rock', value: 3}),
        FindDatabase.upsert({name: '🧱', value: 5}),
        FindDatabase.upsert({name: 'Wood', value: 7}),
        FindDatabase.upsert({name: '👶 found in mine', value: 10}),
        FindDatabase.upsert({name: '💎', value: 300}),
        FindDatabase.upsert({name: '🌠 fragment', value: 1500}),
        FindDatabase.upsert({name: '🥾', value: 1}),
        FindDatabase.upsert({name: '🐟', value: 5}),
        FindDatabase.upsert({name: '🐠', value: 15}),
        FindDatabase.upsert({name: '🦈', value: 30}),
        FindDatabase.upsert({name: '🐙', value: 75}),
        FindDatabase.upsert({name: '👶 fished out of water', value: 300}),
        FindDatabase.upsert({name: '✈️', value: 1500}),
        FindDatabase.upsert({name: '🌠', value: 5000}),

    ];
    const gemShop = [
        GemShop.upsert({name: 'Mystical Bait', cost: 15, id: 7 }),
    ];

    const characterList = [
        CharacterDatabase.upsert({name: 'Tanya von Degurechaff', image_id: 'https://i.imgur.com/A4Iz8yd.jpeg', id: 101 }),
    ];

    await Promise.all(shop);
    await Promise.all(finds);
    await Promise.all(gemShop);
    await Promise.all(characterList);
    console.log('Database synced');

    sequelize.close()
}).catch(console.error)
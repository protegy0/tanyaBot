const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { balance, exp, level, workTime, workExp, job } = require('../../importantfunctions/mutators.js');

function msToTime(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    if (seconds < 60) return seconds + " seconds";
    else if (minutes < 60) return minutes + " minutes";
    else return hours + " hours";
}

const JOBS = {
    'unemployed': {
        name: 'Unemployed',
        emoji: '😴',
        basePay: 0,
        cooldown: 0,
        requiredExp: 0,
        description: 'Not currently employed'
    },
    'beggar': {
        name: 'Street Beggar',
        emoji: '🥺',
        basePay: [5, 15],
        cooldown: 30 * 60 * 1000, // 30 minutes
        requiredExp: 0,
        description: 'Ask for spare change on the streets'
    },
    'janitor': {
        name: 'Janitor',
        emoji: '🧹',
        basePay: [20, 40],
        cooldown: 45 * 60 * 1000, // 45 minutes
        requiredExp: 10,
        description: 'Clean buildings and facilities'
    },
    'cashier': {
        name: 'Cashier',
        emoji: '🛒',
        basePay: [35, 65],
        cooldown: 60 * 60 * 1000, // 1 hour
        requiredExp: 25,
        description: 'Handle customer transactions'
    },
    'delivery': {
        name: 'Delivery Driver',
        emoji: '🚚',
        basePay: [50, 90],
        cooldown: 75 * 60 * 1000, // 1 hour 15 minutes
        requiredExp: 50,
        description: 'Deliver packages around the city'
    },
    'teacher': {
        name: 'Teacher',
        emoji: '👩‍🏫',
        basePay: [80, 120],
        cooldown: 2 * 60 * 60 * 1000, // 2 hours
        requiredExp: 100,
        description: 'Educate the next generation'
    },
    'programmer': {
        name: 'Programmer',
        emoji: '💻',
        basePay: [120, 200],
        cooldown: 3 * 60 * 60 * 1000, // 3 hours
        requiredExp: 200,
        description: 'Write code and develop software'
    },
    'doctor': {
        name: 'Doctor',
        emoji: '👩‍⚕️',
        basePay: [200, 350],
        cooldown: 4 * 60 * 60 * 1000, // 4 hours
        requiredExp: 400,
        description: 'Provide medical care to patients'
    },
    'ceo': {
        name: 'CEO',
        emoji: '👔',
        basePay: [300, 500],
        cooldown: 6 * 60 * 60 * 1000, // 6 hours
        requiredExp: 800,
        description: 'Run a major corporation'
    }
};

const WORK_SCENARIOS = {
    'beggar': [
        'You sit outside a coffee shop and collect {amount} moolah in your cup.',
        'A kind stranger gives you {amount} moolah.',
        'You find {amount} moolah someone dropped on the ground.',
        'A business owner feels bad and gives you {amount} moolah.',
        'You help someone carry groceries and earn {amount} moolah.'
    ],
    'janitor': [
        'You clean the entire office building and earn {amount} moolah.',
        'You fix a broken toilet and get a bonus of {amount} moolah.',
        'You work overtime cleaning and make {amount} moolah.',
        'You deep clean the lobby and earn {amount} moolah.',
        'You organize the supply closet perfectly and get {amount} moolah.'
    ],
    'cashier': [
        'You work a busy shift and earn {amount} moolah.',
        'You handle difficult customers professionally and get {amount} moolah.',
        'You upsell products successfully and earn {amount} moolah in commission.',
        'You count the register perfectly and get a bonus of {amount} moolah.',
        'You work the holiday rush and earn {amount} moolah.'
    ],
    'delivery': [
        'You deliver 20 packages and earn {amount} moolah.',
        'You get great customer reviews and earn {amount} moolah in tips.',
        'You work during peak hours and make {amount} moolah.',
        'You deliver to a fancy neighborhood and earn {amount} moolah.',
        'You complete all deliveries early and get a bonus of {amount} moolah.'
    ],
    'teacher': [
        'You teach an engaging lesson and earn {amount} moolah.',
        'You tutor struggling students after school for {amount} moolah.',
        'You organize a successful field trip and get {amount} moolah.',
        'You grade papers all weekend and earn {amount} moolah.',
        'You mentor new teachers and receive {amount} moolah.'
    ],
    'programmer': [
        'You fix a critical bug and earn {amount} moolah.',
        'You deploy a successful feature and get {amount} moolah.',
        'You optimize database performance and earn {amount} moolah.',
        'You complete a project ahead of deadline for {amount} moolah.',
        'You solve a complex algorithm and get {amount} moolah bonus.'
    ],
    'doctor': [
        'You save a patient\'s life and earn {amount} moolah.',
        'You perform successful surgery and get {amount} moolah.',
        'You work a 12-hour shift and earn {amount} moolah.',
        'You diagnose a rare condition and get {amount} moolah.',
        'You volunteer at a clinic and earn {amount} moolah.'
    ],
    'ceo': [
        'Your company goes public and you earn {amount} moolah.',
        'You close a major business deal worth {amount} moolah.',
        'You acquire a competitor and earn {amount} moolah.',
        'You optimize company operations and save {amount} moolah.',
        'You give a keynote speech and earn {amount} moolah.'
    ]
};

function getAvailableJobs(userWorkExp) {
    return Object.entries(JOBS).filter(([key, job]) => 
        userWorkExp >= job.requiredExp && key !== 'unemployed'
    );
}

function calculatePay(jobData, userLevel, userWorkExp) {
    const [min, max] = jobData.basePay;
    const levelBonus = userLevel * 2;
    const expBonus = Math.floor(userWorkExp / 20);
    const randomPay = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomPay + levelBonus + expBonus;
}

function getRandomScenario(jobKey, amount) {
    const scenarios = WORK_SCENARIOS[jobKey];
    if (!scenarios) return `You work hard and earn ${amount} moolah.`;
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return scenario.replace('{amount}', amount);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work at your job to earn moolah!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('shift')
                .setDescription('Work a shift at your current job'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('apply')
                .setDescription('Apply for a new job')
                .addStringOption(option =>
                    option.setName('job')
                        .setDescription('The job you want to apply for')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('View all available jobs'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('quit')
                .setDescription('Quit your current job'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('View your work information')),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        
        // Add base experience for using work command
        exp.addExp(userId, 3);
        
        const userLevel = level.getLevel(userId);
        const userWorkExp = workExp.getWorkExp(userId);
        const currentJob = job.getJob(userId);
        const lastWorkTime = workTime.getWorkTimes(userId);
        
        switch (subcommand) {
            case 'shift':
                await handleWorkShift(interaction, userId, currentJob, lastWorkTime, userLevel, userWorkExp);
                break;
            case 'apply':
                await handleJobApplication(interaction, userId, userWorkExp);
                break;
            case 'list':
                await handleJobList(interaction, userWorkExp);
                break;
            case 'quit':
                await handleQuitJob(interaction, userId);
                break;
            case 'info':
                await handleWorkInfo(interaction, userId, currentJob, userWorkExp, lastWorkTime);
                break;
        }
    }
};

async function handleWorkShift(interaction, userId, currentJob, lastWorkTime, userLevel, userWorkExp) {
    if (currentJob === 'unemployed') {
        return interaction.reply({
            content: '❌ You need to apply for a job first! Use `/work list` to see available jobs.',
            ephemeral: true
        });
    }
    
    const jobData = JOBS[currentJob];
    const timeSinceWork = Date.now() - lastWorkTime;
    
    if (timeSinceWork < jobData.cooldown) {
        const timeLeft = jobData.cooldown - timeSinceWork;
        return interaction.reply({
            content: `⏰ You're still tired from your last shift! Come back in ${msToTime(timeLeft)}.`,
            ephemeral: true
        });
    }
    
    // Calculate pay and work experience gained
    const payAmount = calculatePay(jobData, userLevel, userWorkExp);
    const expGained = Math.floor(Math.random() * 5) + 3; // 3-7 work exp
    const levelExpGained = Math.floor(payAmount / 10); // Convert some pay to level exp
    
    // Update user data
    await balance.addBalance(userId, payAmount);
    await workExp.addWorkExp(userId, expGained);
    await exp.addExp(userId, levelExpGained);
    await workTime.setWorkTime(userId);
    
    // Create response
    const scenario = getRandomScenario(currentJob, payAmount);
    
    const workEmbed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setAuthor({ name: 'Work Shift Complete!', iconURL: 'https://i.imgur.com/GdZkpPc.png' })
        .setDescription(`${jobData.emoji} **${jobData.name}**\n\n${scenario}`)
        .addFields(
            { name: '💰 Earned', value: `${payAmount} moolah`, inline: true },
            { name: '📈 Work EXP', value: `+${expGained}`, inline: true },
            { name: '⭐ Level EXP', value: `+${levelExpGained}`, inline: true }
        )
        .setFooter({ text: `Next shift available in ${msToTime(jobData.cooldown)}` });
    
    await interaction.reply({ embeds: [workEmbed] });
}

async function handleJobApplication(interaction, userId, userWorkExp) {
    const jobName = interaction.options.getString('job').toLowerCase();
    
    if (!JOBS[jobName]) {
        return interaction.reply({
            content: '❌ That job doesn\'t exist! Use `/work list` to see available jobs.',
            ephemeral: true
        });
    }
    
    const jobData = JOBS[jobName];
    
    if (jobName === 'unemployed') {
        return interaction.reply({
            content: '❌ You can\'t apply to be unemployed! Use `/work quit` instead.',
            ephemeral: true
        });
    }
    
    if (userWorkExp < jobData.requiredExp) {
        return interaction.reply({
            content: `❌ You need ${jobData.requiredExp} work experience to apply for ${jobData.name}. You have ${userWorkExp}.`,
            ephemeral: true
        });
    }
    
    const currentJob = job.getJob(userId);
    if (currentJob === jobName) {
        return interaction.reply({
            content: `❌ You already work as a ${jobData.name}!`,
            ephemeral: true
        });
    }
    
    await job.setJob(userId, jobName);
    
    const embed = new EmbedBuilder()
        .setColor('#3498db')
        .setTitle('🎉 Job Application Accepted!')
        .setDescription(`Congratulations! You are now employed as a **${jobData.name}** ${jobData.emoji}`)
        .addFields(
            { name: '💰 Pay Range', value: `${jobData.basePay[0]}-${jobData.basePay[1]} moolah`, inline: true },
            { name: '⏰ Cooldown', value: msToTime(jobData.cooldown), inline: true },
            { name: '📝 Description', value: jobData.description }
        )
        .setFooter({ text: 'Use /work shift to start working!' });
    
    await interaction.reply({ embeds: [embed] });
}

async function handleJobList(interaction, userWorkExp) {
    const availableJobs = getAvailableJobs(userWorkExp);
    const lockedJobs = Object.entries(JOBS).filter(([key, job]) => 
        userWorkExp < job.requiredExp && key !== 'unemployed'
    );
    
    const embed = new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle('💼 Available Jobs')
        .setDescription('Here are all the jobs you can apply for:');
    
    if (availableJobs.length > 0) {
        const availableText = availableJobs.map(([key, jobData]) => 
            `${jobData.emoji} **${jobData.name}**\n` +
            `💰 ${jobData.basePay[0]}-${jobData.basePay[1]} moolah | ⏰ ${msToTime(jobData.cooldown)}\n` +
            `📝 ${jobData.description}\n`
        ).join('\n');
        
        embed.addFields({ name: '✅ Available Jobs', value: availableText });
    }
    
    if (lockedJobs.length > 0) {
        const lockedText = lockedJobs.slice(0, 5).map(([key, jobData]) => 
            `${jobData.emoji} **${jobData.name}** (Requires ${jobData.requiredExp} work exp)`
        ).join('\n');
        
        embed.addFields({ name: '🔒 Locked Jobs', value: lockedText });
    }
    
    embed.setFooter({ text: `Your work experience: ${userWorkExp} | Use /work apply <job> to apply!` });
    
    await interaction.reply({ embeds: [embed] });
}

async function handleQuitJob(interaction, userId) {
    const currentJob = job.getJob(userId);
    
    if (currentJob === 'unemployed') {
        return interaction.reply({
            content: '❌ You\'re already unemployed!',
            ephemeral: true
        });
    }
    
    const jobData = JOBS[currentJob];
    await job.setJob(userId, 'unemployed');
    
    const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('👋 Job Resignation')
        .setDescription(`You have quit your job as a **${jobData.name}** ${jobData.emoji}`)
        .addFields({ name: 'Status', value: 'You are now unemployed. Use `/work list` to find a new job!' });
    
    await interaction.reply({ embeds: [embed] });
}

async function handleWorkInfo(interaction, userId, currentJob, userWorkExp, lastWorkTime) {
    const jobData = JOBS[currentJob];
    const userLevel = level.getLevel(userId);
    
    const embed = new EmbedBuilder()
        .setColor('#f39c12')
        .setTitle('📊 Work Information')
        .addFields(
            { name: '💼 Current Job', value: `${jobData.emoji} ${jobData.name}`, inline: true },
            { name: '📈 Work Experience', value: `${userWorkExp}`, inline: true },
            { name: '⭐ Level', value: `${userLevel}`, inline: true }
        );
    
    if (currentJob !== 'unemployed') {
        const timeSinceWork = Date.now() - lastWorkTime;
        const canWork = timeSinceWork >= jobData.cooldown;
        const estimatedPay = calculatePay(jobData, userLevel, userWorkExp);
        
        embed.addFields(
            { name: '💰 Estimated Pay', value: `${estimatedPay} moolah`, inline: true },
            { name: '⏰ Next Shift', value: canWork ? 'Available now!' : msToTime(jobData.cooldown - timeSinceWork), inline: true },
            { name: '📝 Job Description', value: jobData.description }
        );
    } else {
        embed.addFields({ name: '📝 Status', value: 'Currently unemployed. Use `/work list` to find a job!' });
    }
    
    await interaction.reply({ embeds: [embed] });
}
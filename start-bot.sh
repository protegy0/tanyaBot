#!/bin/bash

# TanyaBot Startup Script

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"

# Use Node 18
nvm use 18

echo "🚀 Starting TanyaBot..."
echo "📍 Directory: $(pwd)"
echo "🔧 Node Version: $(node --version)"
echo ""

# Check if database exists, if not initialize it
if [ ! -f "discord-bot/database.sqlite" ]; then
    echo "📦 Initializing database..."
    cd discord-bot
    node dbInit.js
    cd ..
    echo "✅ Database initialized!"
    echo ""
fi

echo "🤖 Starting Discord Bot..."
echo "   - CLI Admin Console will appear when bot connects"
echo "   - Use 'help' command in CLI for available commands"
echo ""

# Start the bot
cd discord-bot
node index.js
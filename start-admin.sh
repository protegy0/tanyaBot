#!/bin/bash

# TanyaBot Admin Panel Startup Script

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"

# Use Node 18
nvm use 18

echo "🎛️  Starting TanyaBot Admin Panel..."
echo "📍 Directory: $(pwd)"
echo "🔧 Node Version: $(node --version)"
echo ""
echo "🌐 Admin panel will be available at:"
echo "   http://localhost:3000"
echo ""
echo "📋 Features available:"
echo "   - User currency management"
echo "   - Send messages to Discord channels"
echo "   - Bot statistics and database viewing"
echo ""

# Start the admin panel
node admin-panel.js
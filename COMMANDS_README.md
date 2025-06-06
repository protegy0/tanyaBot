# 🤖 TanyaBot - Complete Command Guide

TanyaBot is a feature-rich Discord economy bot with character collection, gambling, and social features. This guide covers all available commands and their functionality.

## 🏦 Economy System Overview

TanyaBot operates on a **dual-currency system**:
- **💰 Moolah**: Primary currency for gambling, shopping, and transfers
- **💎 Gems**: Premium currency for special items and character recruitment

### 📈 Experience & Leveling
- Most commands award experience points (EXP)
- Level calculation: `(100 × level)^1.1` 
- Higher levels = better daily rewards and work pay

---

## 💰 Economy Commands

### `/balance`
Check your or another user's currency.
```
/balance moolah [@user]     # Check moolah balance
/balance gems [@user]       # Check gem balance
```

### `/daily`
Claim daily rewards (24-hour cooldown).
- **Rewards**: 100 + (level × 2) moolah + 10 gems
- **EXP**: +50

### `/work`
**NEW!** Progressive job system for steady income.
```
/work shift                 # Work at your current job
/work apply <job>          # Apply for a new job
/work list                 # View available jobs
/work info                 # Check work statistics
/work quit                 # Quit current job
```

**Job Progression** (experience required):
1. **Street Beggar** (0) - 5-15 moolah, 30min cooldown
2. **Janitor** (10) - 20-40 moolah, 45min cooldown
3. **Cashier** (25) - 35-65 moolah, 1hr cooldown
4. **Delivery Driver** (50) - 50-90 moolah, 1hr 15min cooldown
5. **Teacher** (100) - 80-120 moolah, 2hr cooldown
6. **Programmer** (200) - 120-200 moolah, 3hr cooldown
7. **Doctor** (400) - 200-350 moolah, 4hr cooldown
8. **CEO** (800) - 300-500 moolah, 6hr cooldown

### `/transfer`
Send moolah to another user.
```
/transfer @user <amount>    # Send moolah (min: 1)
```

### `/steal`
Attempt to steal from another user (24-hour cooldown).
- **Success Rate**: 15%
- **Success**: Steal up to 25% of victim's balance
- **Failure**: Lose ~14% of your balance
- **EXP**: +50 (regardless of outcome)

### `/convert`
Exchange gems for moolah.
- **Rate**: 1 gem = 25 moolah
- **Minimum**: 1 gem

---

## 🛒 Shopping Commands

### `/shop`
View available items and prices.
```
/shop moolah               # View moolah shop
/shop gem                  # View gem shop
```

### `/buy`
Purchase items from shops.
```
/buy moolah <item> [qty]   # Buy from moolah shop (1-300)
/buy gems <item> [qty]     # Buy from gem shop (1-300)
```

**Moolah Shop Items**:
- **Dirty Bait** (7) - Basic fishing bait
- **Clean Bait** (12) - Better fishing bait
- **Great Bait** (18) - Premium fishing bait
- **Chocolate** (150) - Character gift (+10 EXP)
- **Shiny Gift 🎁** (300) - Character gift (+30 EXP)
- **Pretty Phone 📱** (600) - Character gift (+50 EXP)
- **Custom Role Color** (500,000) - Special privilege
- **Protegy Voice Memo** (3,000,000) - Rare collectible
- **Ernie Voice Memo** (10,000,000) - Ultra rare collectible

**Gem Shop Items**:
- **Lovely Gift 💝** (30) - Premium character gift (+70 EXP)

### `/inventory`
View your purchased items (only shows owned items).

---

## 🎲 Gambling Commands
*All gambling commands award +5 EXP*

### `/slots`
Classic slot machine (5 moolah per spin).
```
/slots                     # Spin the reels
```

**Symbols & Payouts**:
- 🍒: 25 moolah (3 match) / 3 moolah (2 match)
- 🍎: 50 moolah (3 match) / 8 moolah (2 match)
- ⭐: 1,000 moolah (3 match) / 15 moolah (2 match)
- 💎: 5,000 moolah (3 match) / 30 moolah (2 match)
- 7️⃣: 50,000 moolah (3 match) / 50 moolah (2 match)

### `/blackjack`
Play blackjack against the dealer.
```
/blackjack <bet>           # Bet amount (min: 1)
```

**Features**:
- Interactive buttons (Hit, Stand, Double Down)
- Blackjack pays 1.5x
- Dealer hits on <17
- Custom card emojis

### `/roulette`
Spin the roulette wheel.
```
/roulette <bet> <color>    # Bet on red/black/green
```

**Payouts**:
- **Red/Black**: 2x payout
- **Green**: 10x payout
- Animated spinning effect

---

## 🎣 Activity Commands

### `/fish`
Go fishing for items and moolah (+4 EXP).
```
/fish                      # Fish with owned bait
```

**Bait Types** (affects success rate):
- **Dirty Bait**: Random 1-1000 outcome
- **Clean Bait**: Random 150-1000 outcome
- **Great Bait**: Random 250-1000 outcome
- **Mystical Bait**: Random 900-1000 outcome (premium)

**Fishing Rewards**:
- 🥾 (1 moolah) - Common
- 🐟 (5 moolah) - Uncommon
- 🐠 (15 moolah) - Rare
- 🦈 (30 moolah) - Very Rare
- 🐙 (75 moolah) - Epic
- 👶 (300 moolah) - Legendary
- ✈️ (1,500 moolah) - Mythical
- 🌠 (5,000 moolah) - Ultra Rare

### `/mine`
Mine for valuable resources (+5 EXP).
```
/mine                      # Mine for items
```

**Mining Rewards**:
- 💩 (1 moolah) - 95%
- Glass Shards (2 moolah) - 2%
- Hard Rock (3 moolah) - 1%
- 🧱 (5 moolah) - 0.75%
- Wood (7 moolah) - 0.5%
- 👶 (10 moolah) - 0.4%
- 💎 (300 moolah) - 0.34%
- 🌠 (1,500 moolah) - 0.01%

### `/finds`
View your collection of found items.
```
/finds [@user]             # View finds (yours or others)
```

---

## 👥 Character & Party System

### `/invite`
Recruit new characters (12-hour cooldown, 120 gems).
```
/invite                    # Recruit random character
```

### `/party`
Manage your character party.
```
/party members             # Browse party with navigation
/party remove <character>  # Release character
/party give <character> <item>  # Gift items for EXP
/party stats <character>   # Allocate stat points
```

**Character Gifts & EXP**:
- **Chocolate**: +10 EXP
- **Shiny Gift 🎁**: +30 EXP
- **Pretty Phone 📱**: +50 EXP
- **Lovely Gift 💝**: +70 EXP

### `/duel`
Battle other users' characters.
```
/duel solo @user           # 1v1 character battle
/duel trio @user           # 3v3 party battle (planned)
```

**Battle System**:
- Turn-based combat using ATK, DEF, HP, SPEED stats
- Winner gets 3 gems, characters gain 30 EXP
- Speed determines tie-breaker

### `/battle`
**NEW!** Comprehensive combat system with NPCs, bosses, and arena PvP.
```
/battle npc <enemy> <character>     # Fight NPCs for rewards
/battle boss <boss> <character>     # Challenge powerful bosses
/battle arena @user <character>     # Quick PvP battles
/battle stats                       # View battle statistics
```

**NPC Enemies** (Level | Rewards):
- **🟢 Green Slime** (1) - 10-25 moolah, 15-25 EXP
- **👹 Cave Goblin** (3) - 25-50 moolah, 25-40 EXP, 1 gem
- **🧌 Fierce Orc** (5) - 50-100 moolah, 40-60 EXP, 2 gems
- **🧟 Mountain Troll** (8) - 100-200 moolah, 60-100 EXP, 3 gems
- **🐉 Ancient Dragon** (15) - 300-500 moolah, 150-250 EXP, 10 gems

**Boss Battles** (Level req. | Cooldown):
- **👑🟢 King Slime** (10 | 6hrs) - 200-400 moolah, 100-150 EXP, 5 gems
- **😈 Demon Lord** (20 | 12hrs) - 500-1000 moolah, 200-300 EXP, 15 gems

**Combat Mechanics**:
- Initiative-based turn order (Speed + randomness)
- Damage = Random(1-ATK) - Defense mitigation
- Character EXP: +50 win, +10-15 loss
- Battle stats tracking (wins/losses/win rate)

---

## 📊 Information Commands

### `/level`
Check experience and level progress.
```
/level [@user]             # View level info
```

### `/leaderboard`
View server rankings.
```
/leaderboard moolah        # Top 10 richest users
/leaderboard gems          # Top 10 gem holders
/leaderboard level         # Top 10 highest levels
```

---

## 🎪 Fun Commands

### `/tanya`
Bot mascot content (+15 EXP).
```
/tanya picture             # Random Tanya image
/tanya quote               # Random anime quote
```

### `/anime`
Search MyAnimeList for anime information.
```
/anime <search_term>       # Search and select anime
```

### `/picture`
Get anime character images.
```
/picture <character_name>  # Fetch character image
```

### `/coinflip`
Simple heads or tails random outcome.
```
/coinflip                  # Flip a coin
```

---

## 🛠️ Utility Commands

### `/ping`
Check bot latency.
```
/ping                      # Show response time
```

### `/server`
Display server information.
```
/server                    # Show server name & member count
```

### `/user`
Display user information.
```
/user [@user]              # Show user info & join date
```

### `/quit`
**NEW!** Stop any active command in the current channel.
```
/quit [reason]             # Stop active command (reason optional)
```

**Permissions**:
- **Command Owner**: Can always quit their own commands
- **Server Admins**: Can quit any command (Administrator or Manage Channels)
- **Others**: Cannot quit commands they didn't start

**Supported Commands**: All interactive commands (battles, arena challenges, etc.)

### `/active`
**NEW!** Show active commands in the channel (Admin only).
```
/active                    # Display current active command info
```

---

## 🔧 Admin Commands
*Owner only (ID: 295074068581974026)*

### `/character`
Manage character database.
```
/character add <name> <image_url> <id>  # Add new character
/character edit <id> [options]          # Modify character
/character delete <id>                  # Remove character
```

### `/give`
Grant currency and reset timers.
```
/give moolah @user <amount>    # Give moolah
/give gems @user <amount>      # Give gems
/give invitetime @user         # Reset invite cooldown
```

---

## 🎯 Strategy Guide

### 💡 Early Game (Level 1-10)
1. **Start with `/daily`** for initial currency
2. **Apply for beggar job** (`/work apply beggar`)
3. **Work every 30 minutes** for steady income
4. **Try fishing** with purchased bait
5. **Save gems** for character recruitment

### 💡 Mid Game (Level 10-25)
1. **Upgrade to janitor/cashier** jobs
2. **Buy better fishing bait** for improved returns
3. **Start gambling** with small amounts
4. **Recruit first character** (`/invite`)
5. **Begin character battles** (`/duel`)

### 💡 Late Game (Level 25+)
1. **Work toward programmer/doctor** jobs
2. **Large gambling sessions** with winnings
3. **Build strong character party**
4. **Participate in PvP** (steal, duel)
5. **Pursue rare collectibles**

---

## 💎 Tips & Tricks

- **Daily routine**: Claim daily → Work → Fish/Mine → Gamble
- **Bait strategy**: Better bait = better fishing outcomes
- **Character investment**: Gift items for stronger battle stats
- **Risk management**: Don't gamble more than you can afford to lose
- **Social features**: Check others' collections and challenge to duels
- **Long-term goals**: Work toward CEO job and rare collectibles

---

## ⏰ Cooldown Summary

| Command | Cooldown | Duration |
|---------|----------|----------|
| `/daily` | 24 hours | 86,400,000ms |
| `/steal` | 24 hours | 86,400,000ms |
| `/invite` | 12 hours | 43,200,000ms |
| `/work shift` | Job dependent | 30min - 6hrs |

---

*TanyaBot offers a complete gaming experience within Discord, combining economy management, character collection, gambling excitement, and social interaction. Start your journey today with `/daily` and `/work list`!*
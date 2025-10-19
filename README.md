# 🎰 Sic Gambling - Roulette Game

A multiplayer roulette gambling site with simulated funds. Play with your friends in private rooms!

![Roulette](https://img.shields.io/badge/Game-Roulette-red) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Socket.io](https://img.shields.io/badge/Socket.io-4.7-white)

## ✨ Features

- 🎰 **Multiple Casino Games**:
  - **Roulette** - Spin the wheel and bet on numbers
  - **Blackjack** - Beat the dealer without going over 21
  - **Texas Hold'em** - Coming soon!
- 🎲 **Room-based gameplay** - Create or join rooms with unique 6-character codes
- 💰 **Simulated funds** - $1,000 starting balance (no real money involved)
- 🎨 **Beautiful, modern UI** - Responsive design with Tailwind CSS
- 🎯 **Roulette betting options**:
  - Straight up (single number) - 35:1 payout
  - Red/Black - 1:1 payout
  - Even/Odd - 1:1 payout
  - High/Low (1-18 / 19-36) - 1:1 payout
- 🃏 **Blackjack features**:
  - Hit, Stand, Double Down
  - Blackjack pays 3:2
  - Dealer must hit on 16
- ⚡ **Auto-spin** - Roulette wheel spins automatically after 20 seconds
- 📱 **Mobile-friendly** - Works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd sic_gambling
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 How to Play

### Creating a Room

1. Enter your name on the home page
2. Click "Create New Room"
3. Share the 6-character room code with your friends
4. Choose a game to play!

### Joining a Room

1. Enter your name on the home page
2. Enter the 6-character room code
3. Click "Join Room"
4. Choose a game to play!

### Playing Roulette

1. **Select a chip value** (5, 10, 25, 50, or 100)
2. **Place your bets**:
   - Click on individual numbers for straight-up bets
   - Click on Red, Black, Even, Odd, Low, or High for outside bets
3. **Spin the wheel** by clicking the "SPIN" button (or wait for auto-spin)
4. **Watch the results** and see if you won!
5. **Remove bets** before spinning by clicking the × on your bet

### Playing Blackjack

1. **Place your bet** by selecting an amount (5, 10, 25, 50, or 100)
2. **Wait for cards** to be dealt (you get 2 cards, dealer gets 2)
3. **Make your decision**:
   - **Hit** - Get another card
   - **Stand** - Keep your current hand
   - **Double Down** - Double your bet and get one more card (only on first 2 cards)
4. **Dealer plays** automatically (must hit on 16 or less)
5. **Win** if your hand is closer to 21 than the dealer without going over!

### Betting Payouts

**Roulette:**
| Bet Type | Payout | Example |
|----------|--------|---------|
| Straight Up (single number) | 35:1 | Bet $10, win $350 |
| Red/Black | 1:1 | Bet $10, win $10 |
| Even/Odd | 1:1 | Bet $10, win $10 |
| High/Low | 1:1 | Bet $10, win $10 |

**Blackjack:**
| Result | Payout | Example |
|--------|--------|---------|
| Blackjack | 3:2 | Bet $10, win $25 |
| Win | 1:1 | Bet $10, win $20 |
| Push (tie) | Return bet | Bet $10, get $10 back |
| Lose | 0 | Bet $10, lose $10 |

## 🌐 Deployment

### ⚠️ Important: Vercel Limitation

**Vercel's serverless functions don't support long-lived WebSocket connections**, which are required for Socket.io. 

### Recommended Deployment Options

#### Option 1: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your repository
4. Railway will auto-detect and deploy
5. Set environment variable: `NEXT_PUBLIC_SOCKET_URL` = your Railway URL
6. Done! 🎉

#### Option 2: Render

1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variable: `NEXT_PUBLIC_SOCKET_URL` = your Render URL
6. Deploy!

#### Option 3: Local with ngrok (for testing)

1. Start your local server: `npm run dev`
2. Install ngrok: `npm install -g ngrok`
3. Expose your server: `ngrok http 3000`
4. Share the ngrok URL with friends

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.io
- **State Management**: Zustand
- **ID Generation**: Nanoid

## 📁 Project Structure

```
sic_gambling/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── room/[code]/       # Room page (dynamic route)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── lib/                   # Utility functions
│   └── gameLogic.ts       # Roulette game logic
├── types/                 # TypeScript types
│   └── game.ts            # Game type definitions
├── server.ts              # Custom Socket.io server
├── package.json           # Dependencies
├── tailwind.config.ts     # Tailwind configuration
└── tsconfig.json          # TypeScript configuration
```

## 🎨 Customization

### Change Starting Balance

Edit `server.ts` line ~70:
```typescript
const player: Player = {
  id: socket.id,
  name: playerName,
  balance: 1000, // Change this value
  bets: [],
}
```

### Change Auto-Spin Timer

Edit `server.ts` line ~140:
```typescript
setTimeout(() => {
  // ... auto-spin logic
}, 20000) // Change to milliseconds (20000 = 20 seconds)
```

### Add More Chip Values

Edit `app/room/[code]/page.tsx` line ~27:
```typescript
const chipValues = [5, 10, 25, 50, 100, 250, 500] // Add more values
```

## 🐛 Troubleshooting

### Socket.io connection issues
- Ensure your deployment platform supports WebSocket connections
- Check that `NEXT_PUBLIC_SOCKET_URL` environment variable is set correctly
- Verify the server is running and accessible

### Room not found
- Make sure the room code is exactly 6 characters
- Check that the Socket.io server is running
- Try creating a new room

### Bets not working
- Ensure you have sufficient balance
- Check that betting phase is active (green "SPIN" button visible)
- Refresh the page and rejoin the room

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📧 Support

For issues or questions:
- Check the [Deployment Guide](DEPLOYMENT.md)
- Review the [Next.js Documentation](https://nextjs.org/docs)
- Check [Socket.io Documentation](https://socket.io/docs/v4)

---

**Enjoy gambling responsibly! Remember, this is for entertainment purposes only with simulated funds.**


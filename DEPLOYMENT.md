# Deployment Guide for Vercel

## Important Note About Socket.io on Vercel

⚠️ **Vercel Serverless Functions Limitation**: The current setup uses a custom Node.js server with Socket.io, which requires a persistent WebSocket connection. Vercel's serverless functions don't support long-lived WebSocket connections by default.

## Deployment Options

### Option 1: Deploy with Railway/Render (Recommended)

For Socket.io to work properly, you need a platform that supports persistent WebSocket connections:

#### Using Railway:
1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js
5. Add environment variable: `NEXT_PUBLIC_SOCKET_URL` = your Railway URL
6. Deploy!

#### Using Render:
1. Go to [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Set:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variable: `NEXT_PUBLIC_SOCKET_URL` = your Render URL
6. Deploy!

### Option 2: Deploy to Vercel (Modified Setup)

If you still want to use Vercel, you'll need to use a separate Socket.io service:

1. Deploy your Next.js app to Vercel
2. Use a Socket.io hosting service like:
   - [Socket.io Cloud](https://www.socket.io/cloud)
   - [Pusher](https://pusher.com)
   - [Ably](https://ably.com)
3. Update the socket connection in `app/room/[code]/page.tsx` to use the external service

### Option 3: Local Development

For local testing with friends:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Use [ngrok](https://ngrok.com) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) to expose your local server:
   ```bash
   # Using ngrok
   ngrok http 3000
   ```

4. Share the ngrok URL with your friends

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

For production, replace with your deployment URL.

## Quick Start (Local)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Features

✅ Real-time multiplayer roulette
✅ Room-based gameplay with unique codes
✅ Simulated funds ($1,000 starting balance)
✅ Multiple betting options:
   - Straight up (single number)
   - Red/Black
   - Even/Odd
   - High/Low (1-18 / 19-36)
✅ Beautiful, responsive UI
✅ Auto-spin after 20 seconds
✅ Real-time balance updates

## Troubleshooting

### Socket.io connection issues
- Make sure your deployment platform supports WebSocket connections
- Check that `NEXT_PUBLIC_SOCKET_URL` is set correctly
- Verify the port is accessible

### Room not found
- Make sure the room code is exactly 6 characters
- Check that the Socket.io server is running

### Bets not working
- Ensure you have sufficient balance
- Check that betting phase is active (green "SPIN" button visible)

## Support

For issues or questions, check:
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs/v4)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)


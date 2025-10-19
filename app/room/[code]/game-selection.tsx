'use client'

import { GAME_SELECTIONS, GameType } from '@/types/games'
import { useRouter } from 'next/navigation'

interface GameSelectionProps {
  roomCode: string
  playerName: string
}

export default function GameSelection({ roomCode, playerName }: GameSelectionProps) {
  const router = useRouter()

  const selectGame = (gameType: GameType) => {
    router.push(`/room/${roomCode}/${gameType.toLowerCase()}?name=${encodeURIComponent(playerName)}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-casino-gold via-yellow-400 to-casino-gold bg-clip-text text-transparent">
            🎰 Sic Gambling
          </h1>
          <p className="text-gray-400">Room: {roomCode}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {GAME_SELECTIONS.map((game) => (
            <button
              key={game.type}
              onClick={() => selectGame(game.type)}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-casino-gold transition-all hover:scale-105 group"
            >
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                {game.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{game.name}</h3>
              <p className="text-gray-400 text-sm">{game.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}


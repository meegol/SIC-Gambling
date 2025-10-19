'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const router = useRouter()

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    router.push(`/room/${code}?name=${encodeURIComponent(playerName)}`)
  }

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }
    if (!roomCode.trim()) {
      alert('Please enter a room code')
      return
    }
    router.push(`/room/${roomCode.toUpperCase()}?name=${encodeURIComponent(playerName)}`)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-casino-gold via-yellow-400 to-casino-gold bg-clip-text text-transparent">
            🎰 Sic Gambling
          </h1>
          <p className="text-gray-400">Play Roulette with Friends</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-casino-gold focus:border-transparent"
              maxLength={20}
            />
          </div>

          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={handleCreateRoom}
              className="w-full bg-gradient-to-r from-casino-gold to-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:from-yellow-400 hover:to-casino-gold transition-all shadow-lg hover:shadow-xl"
            >
              Create New Room
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/50 text-gray-400">OR</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-casino-gold focus:border-transparent uppercase"
              maxLength={6}
            />
          </div>

          <button
            onClick={handleJoinRoom}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Join Room
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>🎲 Simulated funds only • No real money involved</p>
        </div>
      </div>
    </main>
  )
}


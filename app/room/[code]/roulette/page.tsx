'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { Room, Player, Bet, BetType, RED_NUMBERS, BLACK_NUMBERS } from '@/types/game'
import { getNumberColor } from '@/lib/gameLogic'
import { nanoid } from 'nanoid'

export default function RoulettePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomCode = params.code as string
  const playerName = searchParams.get('name') || 'Player'

  const [socket, setSocket] = useState<Socket | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [selectedChip, setSelectedChip] = useState(10)
  const [selectedBetType, setSelectedBetType] = useState<BetType | null>(null)
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])

  const chipValues = [5, 10, 25, 50, 100]

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      newSocket.emit('join-room', { roomCode, playerName })
    })

    newSocket.on('room-update', (updatedRoom: Room) => {
      setRoom(updatedRoom)
      const player = updatedRoom.players.find((p) => p.name === playerName)
      setCurrentPlayer(player || null)
    })

    return () => {
      newSocket.close()
    }
  }, [roomCode, playerName])

  const placeBet = () => {
    if (!selectedBetType || selectedNumbers.length === 0 || !socket) return

    const bet: Omit<Bet, 'id' | 'playerId'> = {
      type: selectedBetType,
      amount: selectedChip,
      numbers: selectedNumbers,
    }

    socket.emit('place-bet', { roomCode, bet })
    setSelectedBetType(null)
    setSelectedNumbers([])
  }

  const removeBet = (betId: string) => {
    if (!socket) return
    socket.emit('remove-bet', { roomCode, betId })
  }

  const spin = () => {
    if (!socket) return
    socket.emit('spin', { roomCode })
  }

  const selectNumber = (number: number) => {
    if (room && !room.canBet) return

    if (selectedBetType === BetType.STRAIGHT_UP) {
      setSelectedNumbers([number])
      placeBet()
    }
  }

  const selectOutsideBet = (betType: BetType) => {
    if (room && !room.canBet) return

    let numbers: number[] = []

    switch (betType) {
      case BetType.RED:
        numbers = RED_NUMBERS
        break
      case BetType.BLACK:
        numbers = BLACK_NUMBERS
        break
      case BetType.EVEN:
        numbers = Array.from({ length: 18 }, (_, i) => (i + 1) * 2)
        break
      case BetType.ODD:
        numbers = Array.from({ length: 18 }, (_, i) => i * 2 + 1)
        break
      case BetType.LOW:
        numbers = Array.from({ length: 18 }, (_, i) => i + 1)
        break
      case BetType.HIGH:
        numbers = Array.from({ length: 18 }, (_, i) => i + 19)
        break
    }

    setSelectedBetType(betType)
    setSelectedNumbers(numbers)
    placeBet()
  }

  const rouletteNumbers = [
    { row: [0], color: 'green' },
    { row: [1, 2, 3], color: 'mixed' },
    { row: [4, 5, 6], color: 'mixed' },
    { row: [7, 8, 9], color: 'mixed' },
    { row: [10, 11, 12], color: 'mixed' },
    { row: [13, 14, 15], color: 'mixed' },
    { row: [16, 17, 18], color: 'mixed' },
    { row: [19, 20, 21], color: 'mixed' },
    { row: [22, 23, 24], color: 'mixed' },
    { row: [25, 26, 27], color: 'mixed' },
    { row: [28, 29, 30], color: 'mixed' },
    { row: [31, 32, 33], color: 'mixed' },
    { row: [34, 35, 36], color: 'mixed' },
  ]

  if (!room || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-casino-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Joining room...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-casino-gold to-yellow-400 bg-clip-text text-transparent">
                🎰 Roulette
              </h1>
              <p className="text-gray-400 text-sm">Room: {roomCode}</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className="text-3xl font-bold text-casino-gold">${currentPlayer.balance}</p>
            </div>
            <button
              onClick={() => router.push(`/room/${roomCode}?name=${encodeURIComponent(playerName)}`)}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Games
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Roulette Table */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold mb-2">Roulette Table</h2>
                {room.spinResult !== undefined && (
                  <div className="text-4xl font-bold">
                    <span className={`px-4 py-2 rounded-lg ${
                      room.spinResult === 0 ? 'bg-green-600' :
                      getNumberColor(room.spinResult) === 'red' ? 'bg-red-600' : 'bg-black'
                    }`}>
                      {room.spinResult}
                    </span>
                  </div>
                )}
                {room.gameState === 'SPINNING' && (
                  <div className="text-2xl animate-pulse">🎰 Spinning...</div>
                )}
              </div>

              {/* Number Grid */}
              <div className="grid grid-cols-4 gap-1 mb-4">
                {rouletteNumbers.map((row, idx) => (
                  <div key={idx} className="contents">
                    {row.row.map((num) => {
                      const color = getNumberColor(num)
                      const isRed = color === 'red'
                      const isGreen = color === 'green'
                      return (
                        <button
                          key={num}
                          onClick={() => selectNumber(num)}
                          disabled={!room.canBet}
                          className={`roulette-number ${
                            isGreen ? 'bg-green-600' : isRed ? 'bg-red-600' : 'bg-black'
                          } ${!room.canBet ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {num}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Outside Bets */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => selectOutsideBet(BetType.RED)}
                    disabled={!room.canBet}
                    className="bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    RED
                  </button>
                  <button
                    onClick={() => selectOutsideBet(BetType.BLACK)}
                    disabled={!room.canBet}
                    className="bg-black hover:bg-gray-900 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    BLACK
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => selectOutsideBet(BetType.EVEN)}
                    disabled={!room.canBet}
                    className="bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    EVEN
                  </button>
                  <button
                    onClick={() => selectOutsideBet(BetType.ODD)}
                    disabled={!room.canBet}
                    className="bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ODD
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => selectOutsideBet(BetType.LOW)}
                    disabled={!room.canBet}
                    className="bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    1-18
                  </button>
                  <button
                    onClick={() => selectOutsideBet(BetType.HIGH)}
                    disabled={!room.canBet}
                    className="bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    19-36
                  </button>
                </div>
              </div>

              {/* Spin Button */}
              {room.gameState === 'BETTING' && (
                <button
                  onClick={spin}
                  className="w-full mt-4 bg-gradient-to-r from-casino-gold to-yellow-400 text-gray-900 font-bold py-4 rounded-lg hover:from-yellow-400 hover:to-casino-gold transition-all shadow-lg hover:shadow-xl text-xl"
                >
                  🎰 SPIN
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Chip Selection */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
              <h3 className="font-bold mb-3">Select Chip</h3>
              <div className="grid grid-cols-5 gap-2">
                {chipValues.map((value) => (
                  <button
                    key={value}
                    onClick={() => setSelectedChip(value)}
                    className={`betting-chip ${
                      selectedChip === value ? 'ring-4 ring-casino-gold scale-110' : ''
                    } ${
                      value === 5 ? 'bg-blue-600' :
                      value === 10 ? 'bg-green-600' :
                      value === 25 ? 'bg-red-600' :
                      value === 50 ? 'bg-purple-600' :
                      'bg-casino-gold'
                    }`}
                  >
                    ${value}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Bets */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
              <h3 className="font-bold mb-3">Your Bets</h3>
              {currentPlayer.bets.length === 0 ? (
                <p className="text-gray-400 text-sm">No bets placed</p>
              ) : (
                <div className="space-y-2">
                  {currentPlayer.bets.map((bet) => (
                    <div
                      key={bet.id}
                      className="bg-gray-700/50 p-2 rounded flex justify-between items-center"
                    >
                      <div className="text-sm">
                        <p className="font-medium">{bet.type.replace(/_/g, ' ')}</p>
                        <p className="text-gray-400">${bet.amount}</p>
                      </div>
                      {room.canBet && (
                        <button
                          onClick={() => removeBet(bet.id)}
                          className="text-red-400 hover:text-red-300 text-xl"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Players */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
              <h3 className="font-bold mb-3">Players ({room.players.length})</h3>
              <div className="space-y-2">
                {room.players.map((player) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded ${
                      player.id === currentPlayer.id ? 'bg-casino-gold/20' : 'bg-gray-700/50'
                    }`}
                  >
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-gray-400">${player.balance}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


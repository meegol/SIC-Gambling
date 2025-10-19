'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { BlackjackGame, BlackjackPlayer, BlackjackGameState, BlackjackAction } from '@/types/blackjack'
import { calculateHandValue } from '@/lib/blackjackLogic'
import { getCardImagePath } from '@/lib/cardAssets'
import Image from 'next/image'

export default function BlackjackPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomCode = params.code as string
  const playerName = searchParams.get('name') || 'Player'

  const [socket, setSocket] = useState<Socket | null>(null)
  const [game, setGame] = useState<BlackjackGame | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<BlackjackPlayer | null>(null)
  const [betAmount, setBetAmount] = useState(10)

  const betAmounts = [5, 10, 25, 50, 100]

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      newSocket.emit('join-blackjack', { roomCode, playerName })
    })

    newSocket.on('blackjack-update', (updatedGame: BlackjackGame) => {
      setGame(updatedGame)
      const player = updatedGame.players.find((p) => p.name === playerName)
      setCurrentPlayer(player || null)
    })

    return () => {
      newSocket.close()
    }
  }, [roomCode, playerName])

  const placeBet = () => {
    if (!socket || !currentPlayer || currentPlayer.balance < betAmount) return
    socket.emit('place-blackjack-bet', { roomCode, betAmount })
  }

  const hit = () => {
    if (!socket) return
    socket.emit('blackjack-action', { roomCode, action: BlackjackAction.HIT })
  }

  const stand = () => {
    if (!socket) return
    socket.emit('blackjack-action', { roomCode, action: BlackjackAction.STAND })
  }

  const double = () => {
    if (!socket || !currentPlayer || currentPlayer.balance < currentPlayer.bet) return
    socket.emit('blackjack-action', { roomCode, action: BlackjackAction.DOUBLE })
  }

  if (!game || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-casino-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Joining game...</p>
        </div>
      </div>
    )
  }

  const isCurrentPlayerTurn = game.currentPlayerIndex >= 0 && 
    game.players[game.currentPlayerIndex]?.id === currentPlayer.id

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-casino-gold to-yellow-400 bg-clip-text text-transparent">
                🃏 Blackjack
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
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
              {/* Dealer */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">Dealer</h3>
                <div className="flex gap-2 flex-wrap">
                  {game.dealerHand.map((card, idx) => (
                    <Image
                      key={idx}
                      src={getCardImagePath(card, 'medium')}
                      alt={`${card.rank} of ${card.suit}`}
                      width={80}
                      height={112}
                      className="rounded-lg"
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Value: {calculateHandValue(game.dealerHand)}
                </p>
              </div>

              {/* Current Player */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">
                  Your Hand {currentPlayer.hasBlackjack && '🎉 BLACKJACK!'}
                  {currentPlayer.isBusted && '💥 BUSTED!'}
                </h3>
                <div className="flex gap-2 flex-wrap">
                  {currentPlayer.hand.map((card, idx) => (
                    <Image
                      key={idx}
                      src={getCardImagePath(card, 'medium')}
                      alt={`${card.rank} of ${card.suit}`}
                      width={80}
                      height={112}
                      className="rounded-lg"
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Value: {calculateHandValue(currentPlayer.hand)}
                </p>
                {currentPlayer.bet > 0 && (
                  <p className="mt-1 text-sm text-yellow-400">
                    Bet: ${currentPlayer.bet}
                  </p>
                )}
              </div>

              {/* Game Actions */}
              {game.gameState === BlackjackGameState.BETTING && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bet Amount</label>
                    <div className="flex gap-2">
                      {betAmounts.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setBetAmount(amount)}
                          className={`px-4 py-2 rounded-lg font-bold transition-all ${
                            betAmount === amount
                              ? 'bg-casino-gold text-gray-900'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={placeBet}
                    disabled={currentPlayer.balance < betAmount}
                    className="w-full bg-gradient-to-r from-casino-gold to-yellow-400 text-gray-900 font-bold py-3 rounded-lg hover:from-yellow-400 hover:to-casino-gold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Place Bet
                  </button>
                </div>
              )}

              {game.gameState === BlackjackGameState.PLAYING && isCurrentPlayerTurn && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={hit}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-all"
                    >
                      Hit
                    </button>
                    <button
                      onClick={stand}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all"
                    >
                      Stand
                    </button>
                  </div>
                  {currentPlayer.balance >= currentPlayer.bet && currentPlayer.hand.length === 2 && (
                    <button
                      onClick={double}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all"
                    >
                      Double Down
                    </button>
                  )}
                </div>
              )}

              {game.gameState === BlackjackGameState.PLAYING && !isCurrentPlayerTurn && (
                <div className="text-center py-4 text-gray-400">
                  Waiting for other players...
                </div>
              )}

              {game.gameState === BlackjackGameState.DEALER_TURN && (
                <div className="text-center py-4">
                  <div className="text-2xl animate-pulse">🎰 Dealer's Turn...</div>
                </div>
              )}

              {game.gameState === BlackjackGameState.RESULTS && (
                <div className="text-center py-4">
                  <div className="text-2xl font-bold">Round Complete!</div>
                  <p className="text-gray-400 mt-2">Results will be shown shortly...</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Players */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
              <h3 className="font-bold mb-3">Players ({game.players.length})</h3>
              <div className="space-y-2">
                {game.players.map((player, idx) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded ${
                      player.id === currentPlayer.id
                        ? 'bg-casino-gold/20'
                        : idx === game.currentPlayerIndex
                        ? 'bg-blue-500/20'
                        : 'bg-gray-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{player.name}</p>
                      {idx === game.currentPlayerIndex && (
                        <span className="text-xs bg-blue-500 px-2 py-1 rounded">Turn</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">${player.balance}</p>
                    {player.bet > 0 && (
                      <p className="text-xs text-yellow-400">Bet: ${player.bet}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Rules */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
              <h3 className="font-bold mb-3">Rules</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Get as close to 21 as possible</li>
                <li>• Face cards = 10</li>
                <li>• Aces = 1 or 11</li>
                <li>• Blackjack pays 3:2</li>
                <li>• Dealer must hit on 16</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { PokerGame, PokerPlayer, PokerGameState, PokerAction } from '@/types/poker'
import { getCardDisplay, getCardColor } from '@/lib/pokerLogic'

export default function PokerPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomCode = params.code as string
  const playerName = searchParams.get('name') || 'Player'

  const [socket, setSocket] = useState<Socket | null>(null)
  const [game, setGame] = useState<PokerGame | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<PokerPlayer | null>(null)
  const [raiseAmount, setRaiseAmount] = useState(20)

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      newSocket.emit('join-poker', { roomCode, playerName })
    })

    newSocket.on('poker-update', (updatedGame: PokerGame) => {
      setGame(updatedGame)
      const player = updatedGame.players.find((p) => p.name === playerName)
      setCurrentPlayer(player || null)
    })

    return () => {
      newSocket.close()
    }
  }, [roomCode, playerName])

  const pokerAction = (action: PokerAction, amount?: number) => {
    if (!socket) return
    socket.emit('poker-action', { roomCode, action, amount })
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

  const callAmount = game.currentBet - currentPlayer.totalBet

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-casino-gold to-yellow-400 bg-clip-text text-transparent">
                🎴 Texas Hold'em
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
              {/* Pot */}
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm">Pot</p>
                <p className="text-3xl font-bold text-casino-gold">${game.pot}</p>
                {game.currentBet > 0 && (
                  <p className="text-sm text-gray-400 mt-1">Current Bet: ${game.currentBet}</p>
                )}
              </div>

              {/* Community Cards */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 text-center">Community Cards</h3>
                <div className="flex gap-2 justify-center flex-wrap">
                  {game.communityCards.map((card, idx) => (
                    <div
                      key={idx}
                      className={`w-16 h-24 bg-gray-900 rounded-lg flex flex-col items-center justify-center border-2 border-gray-600 ${getCardColor(card)}`}
                    >
                      <div className="text-xs">{getCardDisplay(card)}</div>
                    </div>
                  ))}
                  {game.communityCards.length === 0 && (
                    <p className="text-gray-500 text-sm">No community cards yet</p>
                  )}
                </div>
              </div>

              {/* Your Hand */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">Your Hand</h3>
                <div className="flex gap-2 justify-center">
                  {currentPlayer.hand.map((card, idx) => (
                    <div
                      key={idx}
                      className={`w-16 h-24 bg-gray-900 rounded-lg flex flex-col items-center justify-center border-2 border-gray-600 ${getCardColor(card)}`}
                    >
                      <div className="text-xs">{getCardDisplay(card)}</div>
                    </div>
                  ))}
                </div>
                {currentPlayer.bet > 0 && (
                  <p className="text-center mt-2 text-sm text-yellow-400">
                    Your Bet: ${currentPlayer.bet} | Total: ${currentPlayer.totalBet}
                  </p>
                )}
              </div>

              {/* Game Actions */}
              {game.gameState !== PokerGameState.WAITING && game.gameState !== PokerGameState.RESULTS && (
                <div className="space-y-4">
                  {isCurrentPlayerTurn && !currentPlayer.isFolded && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => pokerAction(PokerAction.FOLD)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all"
                        >
                          Fold
                        </button>
                        <button
                          onClick={() => pokerAction(PokerAction.CHECK)}
                          disabled={callAmount > 0}
                          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {callAmount > 0 ? `Call $${callAmount}` : 'Check'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={raiseAmount}
                          onChange={(e) => setRaiseAmount(parseInt(e.target.value) || 0)}
                          min={game.currentBet * 2}
                          max={currentPlayer.balance}
                          className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                          placeholder="Raise amount"
                        />
                        <button
                          onClick={() => pokerAction(PokerAction.RAISE, raiseAmount)}
                          disabled={raiseAmount < game.currentBet * 2 || raiseAmount > currentPlayer.balance}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Raise
                        </button>
                      </div>
                      <button
                        onClick={() => pokerAction(PokerAction.ALL_IN)}
                        disabled={currentPlayer.balance === 0}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        All In (${currentPlayer.balance})
                      </button>
                    </>
                  )}
                  {!isCurrentPlayerTurn && !currentPlayer.isFolded && (
                    <div className="text-center py-4 text-gray-400">
                      Waiting for other players...
                    </div>
                  )}
                  {currentPlayer.isFolded && (
                    <div className="text-center py-4 text-red-400">
                      You Folded
                    </div>
                  )}
                </div>
              )}

              {game.gameState === PokerGameState.RESULTS && (
                <div className="text-center py-4">
                  <div className="text-2xl font-bold">Round Complete!</div>
                  <p className="text-gray-400 mt-2">Starting next round...</p>
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
                      {player.isFolded && (
                        <span className="text-xs bg-red-500 px-2 py-1 rounded">Folded</span>
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
                <li>• Small Blind: $5</li>
                <li>• Big Blind: $10</li>
                <li>• Minimum Raise: 2x current bet</li>
                <li>• Best 5-card hand wins</li>
                <li>• All-in available anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


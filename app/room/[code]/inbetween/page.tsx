'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { InBetweenGame, InBetweenPlayer, InBetweenGameState } from '@/types/inbetween'
import { areCardsEqual } from '@/lib/inbetweenLogic'
import { getCardImagePath } from '@/lib/cardAssets'
import Image from 'next/image'

export default function InBetweenPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomCode = params.code as string
  const playerName = searchParams.get('name') || 'Player'

  const [socket, setSocket] = useState<Socket | null>(null)
  const [game, setGame] = useState<InBetweenGame | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<InBetweenPlayer | null>(null)

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      newSocket.emit('join-inbetween', { roomCode, playerName })
    })

    newSocket.on('inbetween-update', (updatedGame: InBetweenGame) => {
      setGame(updatedGame)
      const player = updatedGame.players.find((p) => p.name === playerName)
      setCurrentPlayer(player || null)
    })

    return () => {
      newSocket.close()
    }
  }, [roomCode, playerName])

  const playHand = () => {
    if (!socket) return
    socket.emit('inbetween-action', { roomCode, action: 'PLAY' })
  }

  const foldHand = () => {
    if (!socket) return
    socket.emit('inbetween-action', { roomCode, action: 'FOLD' })
  }

  const chooseHigher = () => {
    if (!socket) return
    socket.emit('inbetween-action', { roomCode, action: 'HIGHER' })
  }

  const chooseLower = () => {
    if (!socket) return
    socket.emit('inbetween-action', { roomCode, action: 'LOWER' })
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

  const needsHigherLowerChoice = isCurrentPlayerTurn && 
    currentPlayer.hand.length === 2 && 
    areCardsEqual(currentPlayer.hand[0], currentPlayer.hand[1]) &&
    currentPlayer.isChoosingHigher === null

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-casino-gold to-yellow-400 bg-clip-text text-transparent">
                🎯 In Between
              </h1>
              <p className="text-gray-400 text-sm">Room: {roomCode}</p>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-sm text-gray-400">Your Balance</p>
              <p className="text-3xl font-bold text-casino-gold">₱{currentPlayer.balance}</p>
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
                <p className="text-3xl font-bold text-casino-gold">₱{game.pot}</p>
                {game.currentBet > 0 && (
                  <p className="text-sm text-gray-400 mt-1">Current Bet: ₱{game.currentBet}</p>
                )}
              </div>

              {/* Your Hand */}
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">
                  Your Hand
                  {currentPlayer.hasWon && ' 🎉 WINNER!'}
                  {currentPlayer.hasPlayed && !currentPlayer.hasWon && ' 💥 Lost'}
                  {currentPlayer.hasFolded && ' ❌ Folded'}
                </h3>
                <div className="flex gap-4 justify-center items-center">
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
                  {currentPlayer.thirdCard && (
                    <>
                      <div className="text-2xl text-gray-600">→</div>
                      <Image
                        src={getCardImagePath(currentPlayer.thirdCard, 'medium')}
                        alt={`${currentPlayer.thirdCard.rank} of ${currentPlayer.thirdCard.suit}`}
                        width={80}
                        height={112}
                        className="rounded-lg border-2 border-casino-gold"
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Game Actions */}
              {game.gameState === InBetweenGameState.CHOOSING && isCurrentPlayerTurn && !currentPlayer.hasFolded && (
                <div className="space-y-4">
                  {needsHigherLowerChoice ? (
                    <div>
                      <p className="text-center text-lg mb-4">You have two cards of the same value! Choose:</p>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={chooseHigher}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-all text-xl"
                        >
                          Higher
                        </button>
                        <button
                          onClick={chooseLower}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all text-xl"
                        >
                          Lower
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={playHand}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition-all text-xl"
                      >
                        Play Hand
                      </button>
                      <button
                        onClick={foldHand}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all text-xl"
                      >
                        Fold
                      </button>
                    </div>
                  )}
                </div>
              )}

              {game.gameState === InBetweenGameState.PLAYING && isCurrentPlayerTurn && (
                <div className="text-center py-4">
                  <div className="text-2xl animate-pulse">🎲 Drawing card...</div>
                </div>
              )}

              {!isCurrentPlayerTurn && game.gameState === InBetweenGameState.CHOOSING && !currentPlayer.hasFolded && (
                <div className="text-center py-4 text-gray-400">
                  Waiting for other players to decide...
                </div>
              )}

              {currentPlayer.hasFolded && (
                <div className="text-center py-4 text-red-400">
                  You Folded
                </div>
              )}

              {game.gameState === InBetweenGameState.RESULTS && (
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
                      {player.hasFolded && (
                        <span className="text-xs bg-red-500 px-2 py-1 rounded">Folded</span>
                      )}
                      {player.hasWon && (
                        <span className="text-xs bg-green-500 px-2 py-1 rounded">Winner!</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">₱{player.balance}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Game Rules */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
              <h3 className="font-bold mb-3">Rules</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Starting bet: ₱1</li>
                <li>• Draw a card between your two cards</li>
                <li>• If you lose, bet doubles</li>
                <li>• If you win, take the pot!</li>
                <li>• Same value cards: choose higher/lower</li>
                <li>• A=1, J=11, Q=12, K=13</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


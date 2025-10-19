import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { nanoid } from 'nanoid'
import { Room, Player, Bet, GameState } from './types/game'
import { spinWheel, calculateWinnings } from './lib/gameLogic'
import { BlackjackGame, BlackjackPlayer, BlackjackGameState, BlackjackAction } from './types/blackjack'
import { createDeck, dealCard, calculateHandValue, hasBlackjack, isBusted } from './lib/blackjackLogic'
import { PokerGame, PokerPlayer, PokerGameState, PokerAction, PokerRound } from './types/poker'
import { createDeck as createPokerDeck, dealCard as dealPokerCard } from './lib/pokerLogic'
import { InBetweenGame, InBetweenPlayer, InBetweenGameState } from './types/inbetween'
import { createDeck as createInBetweenDeck, dealCard as dealInBetweenCard, isCardBetween, areCardsEqual, isCardHigher } from './lib/inbetweenLogic'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const rooms = new Map<string, Room>()
const blackjackGames = new Map<string, BlackjackGame>()
const pokerGames = new Map<string, PokerGame>()
const inBetweenGames = new Map<string, InBetweenGame>()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    socket.on('join-room', (data: { roomCode: string; playerName: string }) => {
      const { roomCode, playerName } = data
      
      if (!rooms.has(roomCode)) {
        rooms.set(roomCode, {
          code: roomCode,
          players: [],
          gameState: GameState.WAITING,
          currentBets: [],
          canBet: false,
        })
      }

      const room = rooms.get(roomCode)!
      const player: Player = {
        id: socket.id,
        name: playerName,
        balance: 1000,
        bets: [],
      }

      room.players.push(player)
      socket.join(roomCode)

      io.to(roomCode).emit('room-update', room)
      console.log(`${playerName} joined room ${roomCode}`)

      // Start betting phase if enough players
      if (room.players.length >= 1 && room.gameState === GameState.WAITING) {
        startBettingPhase(room)
      }
    })

    socket.on('place-bet', (data: { roomCode: string; bet: Omit<Bet, 'id' | 'playerId'> }) => {
      const { roomCode, bet } = data
      const room = rooms.get(roomCode)

      if (!room || !room.canBet) return

      const player = room.players.find((p) => p.id === socket.id)
      if (!player || player.balance < bet.amount) return

      const newBet: Bet = {
        ...bet,
        id: nanoid(),
        playerId: socket.id,
      }

      room.currentBets.push(newBet)
      player.bets.push(newBet)
      player.balance -= bet.amount

      io.to(roomCode).emit('room-update', room)
    })

    socket.on('remove-bet', (data: { roomCode: string; betId: string }) => {
      const { roomCode, betId } = data
      const room = rooms.get(roomCode)

      if (!room || !room.canBet) return

      const player = room.players.find((p) => p.id === socket.id)
      if (!player) return

      const bet = player.bets.find((b) => b.id === betId)
      if (!bet) return

      player.bets = player.bets.filter((b) => b.id !== betId)
      room.currentBets = room.currentBets.filter((b) => b.id !== betId)
      player.balance += bet.amount

      io.to(roomCode).emit('room-update', room)
    })

    socket.on('spin', (data: { roomCode: string }) => {
      const { roomCode } = data
      const room = rooms.get(roomCode)

      if (!room || !room.canBet || room.players.length === 0) return

      room.canBet = false
      room.gameState = GameState.SPINNING
      io.to(roomCode).emit('room-update', room)

      // Simulate spinning for 3 seconds
      setTimeout(() => {
        const winningNumber = spinWheel()
        room.spinResult = winningNumber
        room.gameState = GameState.RESULTS

        // Calculate winnings
        room.currentBets.forEach((bet) => {
          const winnings = calculateWinnings(bet, winningNumber)
          const player = room.players.find((p) => p.id === bet.playerId)
          if (player) {
            player.balance += winnings
          }
        })

        // Clear bets
        room.players.forEach((p) => (p.bets = []))
        room.currentBets = []

        io.to(roomCode).emit('room-update', room)

        // Start next round after 5 seconds
        setTimeout(() => {
          room.spinResult = undefined
          startBettingPhase(room)
        }, 5000)
      }, 3000)
    })

    // Blackjack handlers
    socket.on('join-blackjack', (data: { roomCode: string; playerName: string }) => {
      const { roomCode, playerName } = data
      
      if (!blackjackGames.has(roomCode)) {
        blackjackGames.set(roomCode, {
          code: roomCode,
          players: [],
          dealerHand: [],
          currentPlayerIndex: -1,
          gameState: BlackjackGameState.WAITING,
          canBet: false,
          deck: createDeck(),
        })
      }

      const game = blackjackGames.get(roomCode)!
      
      // Check if player already exists
      const existingPlayer = game.players.find((p) => p.id === socket.id)
      if (existingPlayer) {
        console.log(`${playerName} already in blackjack game`)
        io.to(roomCode).emit('blackjack-update', game)
        return
      }

      const player: BlackjackPlayer = {
        id: socket.id,
        name: playerName,
        balance: 1000,
        hand: [],
        bet: 0,
        isStanding: false,
        hasBlackjack: false,
        isBusted: false,
      }

      game.players.push(player)
      socket.join(roomCode)

      io.to(roomCode).emit('blackjack-update', game)
      console.log(`${playerName} joined blackjack room ${roomCode}`)

      if (game.players.length >= 1 && game.gameState === BlackjackGameState.WAITING) {
        startBlackjackBetting(game)
      }
    })

    socket.on('place-blackjack-bet', (data: { roomCode: string; betAmount: number }) => {
      const { roomCode, betAmount } = data
      const game = blackjackGames.get(roomCode)

      if (!game || !game.canBet) return

      const player = game.players.find((p) => p.id === socket.id)
      if (!player || player.balance < betAmount) return

      player.bet = betAmount
      player.balance -= betAmount

      io.to(roomCode).emit('blackjack-update', game)

      // Start game if all players have bet
      if (game.players.every((p) => p.bet > 0)) {
        startBlackjackGame(game)
      }
    })

    socket.on('blackjack-action', (data: { roomCode: string; action: BlackjackAction }) => {
      const { roomCode, action } = data
      const game = blackjackGames.get(roomCode)

      if (!game || game.gameState !== BlackjackGameState.PLAYING) return

      const player = game.players[game.currentPlayerIndex]
      if (!player || player.id !== socket.id) return

      if (action === BlackjackAction.HIT) {
        const card = dealCard(game.deck)
        if (card) {
          player.hand.push(card)
          player.hasBlackjack = hasBlackjack(player.hand)
          player.isBusted = isBusted(player.hand)
          
          if (player.isBusted || player.hasBlackjack) {
            nextPlayer(game)
          }
        }
      } else if (action === BlackjackAction.STAND) {
        player.isStanding = true
        nextPlayer(game)
      } else if (action === BlackjackAction.DOUBLE && player.hand.length === 2) {
        if (player.balance >= player.bet) {
          player.balance -= player.bet
          player.bet *= 2
          const card = dealCard(game.deck)
          if (card) {
            player.hand.push(card)
            player.hasBlackjack = hasBlackjack(player.hand)
            player.isBusted = isBusted(player.hand)
          }
          player.isStanding = true
          nextPlayer(game)
        }
      }

      io.to(roomCode).emit('blackjack-update', game)
    })

    // Poker handlers
    socket.on('join-poker', (data: { roomCode: string; playerName: string }) => {
      const { roomCode, playerName } = data
      
      if (!pokerGames.has(roomCode)) {
        pokerGames.set(roomCode, {
          code: roomCode,
          players: [],
          communityCards: [],
          pot: 0,
          currentBet: 0,
          dealerIndex: 0,
          currentPlayerIndex: -1,
          gameState: PokerGameState.WAITING,
          currentRound: PokerRound.WAITING,
          deck: createPokerDeck(),
        })
      }

      const game = pokerGames.get(roomCode)!
      
      // Check if player already exists
      const existingPlayer = game.players.find((p) => p.id === socket.id)
      if (existingPlayer) {
        console.log(`${playerName} already in poker game`)
        io.to(roomCode).emit('poker-update', game)
        return
      }

      const player: PokerPlayer = {
        id: socket.id,
        name: playerName,
        balance: 1000,
        hand: [],
        bet: 0,
        totalBet: 0,
        isFolded: false,
        isAllIn: false,
        hasActed: false,
      }

      game.players.push(player)
      socket.join(roomCode)

      io.to(roomCode).emit('poker-update', game)
      console.log(`${playerName} joined poker room ${roomCode}`)

      if (game.players.length >= 2 && game.gameState === PokerGameState.WAITING) {
        startPokerGame(game)
      }
    })

    socket.on('poker-action', (data: { roomCode: string; action: PokerAction; amount?: number }) => {
      const { roomCode, action, amount } = data
      const game = pokerGames.get(roomCode)

      if (!game || game.currentPlayerIndex < 0) return

      const player = game.players[game.currentPlayerIndex]
      if (!player || player.id !== socket.id) return

      if (action === PokerAction.FOLD) {
        player.isFolded = true
        player.hasActed = true
        nextPokerPlayer(game)
      } else if (action === PokerAction.CHECK) {
        player.hasActed = true
        nextPokerPlayer(game)
      } else if (action === PokerAction.CALL) {
        const callAmount = game.currentBet - player.totalBet
        if (player.balance >= callAmount) {
          player.balance -= callAmount
          player.bet += callAmount
          player.totalBet += callAmount
          game.pot += callAmount
          player.hasActed = true
          nextPokerPlayer(game)
        }
      } else if (action === PokerAction.RAISE && amount) {
        if (player.balance >= amount && amount >= game.currentBet * 2) {
          player.balance -= amount
          player.bet += amount
          player.totalBet += amount
          game.pot += amount
          game.currentBet = player.totalBet
          player.hasActed = true
          nextPokerPlayer(game)
        }
      } else if (action === PokerAction.ALL_IN) {
        const allInAmount = player.balance
        player.balance = 0
        player.bet += allInAmount
        player.totalBet += allInAmount
        game.pot += allInAmount
        player.isAllIn = true
        player.hasActed = true
        nextPokerPlayer(game)
      }

      io.to(roomCode).emit('poker-update', game)
    })

    // In Between handlers
    socket.on('join-inbetween', (data: { roomCode: string; playerName: string }) => {
      const { roomCode, playerName } = data
      
      if (!inBetweenGames.has(roomCode)) {
        inBetweenGames.set(roomCode, {
          code: roomCode,
          players: [],
          pot: 0,
          currentBet: 1,
          currentPlayerIndex: -1,
          gameState: InBetweenGameState.WAITING,
          deck: createInBetweenDeck(),
          round: 1,
        })
      }

      const game = inBetweenGames.get(roomCode)!
      
      // Check if player already exists
      const existingPlayer = game.players.find((p) => p.id === socket.id)
      if (existingPlayer) {
        console.log(`${playerName} already in game`)
        io.to(roomCode).emit('inbetween-update', game)
        return
      }

      const player: InBetweenPlayer = {
        id: socket.id,
        name: playerName,
        balance: 1000,
        hand: [],
        bet: 0,
        hasPlayed: false,
        hasWon: false,
        hasFolded: false,
        isChoosingHigher: null,
      }

      game.players.push(player)
      socket.join(roomCode)

      io.to(roomCode).emit('inbetween-update', game)
      console.log(`${playerName} joined inbetween room ${roomCode}`)

      if (game.players.length >= 2 && game.gameState === InBetweenGameState.WAITING) {
        startInBetweenGame(game)
      }
    })

    socket.on('inbetween-action', (data: { roomCode: string; action: string }) => {
      const { roomCode, action } = data
      const game = inBetweenGames.get(roomCode)

      if (!game || game.currentPlayerIndex < 0) {
        console.log('Game not found or no current player')
        return
      }

      const player = game.players[game.currentPlayerIndex]
      if (!player || player.id !== socket.id) {
        console.log('Not current player or player not found')
        return
      }

      if (action === 'FOLD') {
        player.hasFolded = true
        console.log(`${player.name} folded`)
        io.to(roomCode).emit('inbetween-update', game)
        nextInBetweenPlayer(game)
        return
      } else if (action === 'PLAY') {
        // Draw third card
        const thirdCard = dealInBetweenCard(game.deck)
        if (thirdCard) {
          player.thirdCard = thirdCard
          
          // Check if player has two equal cards
          if (areCardsEqual(player.hand[0], player.hand[1])) {
            // Player needs to choose higher or lower
            game.gameState = InBetweenGameState.HIGHER_LOWER
            io.to(roomCode).emit('inbetween-update', game)
            return
          } else {
            // Check if card is between
            const won = isCardBetween(player.hand[0], player.hand[1], thirdCard)
            player.hasPlayed = true
            player.hasWon = won

            if (won) {
              // Player wins the pot!
              player.balance += game.pot
              game.pot = 0
              game.gameState = InBetweenGameState.RESULTS
            } else {
              // Player loses, add to pot
              player.balance -= game.currentBet
              game.pot += game.currentBet
              game.currentBet *= 2 // Double the bet
            }

            io.to(roomCode).emit('inbetween-update', game)
            nextInBetweenPlayer(game)
            return
          }
        }
      } else if (action === 'HIGHER' || action === 'LOWER') {
        const thirdCard = player.thirdCard
        if (thirdCard && player.hand.length === 2) {
          player.isChoosingHigher = action === 'HIGHER'
          
          // Check if the third card matches the player's choice
          const cardValue = player.hand[0].value
          const thirdCardValue = thirdCard.value
          
          const won = action === 'HIGHER' 
            ? thirdCardValue > cardValue
            : thirdCardValue < cardValue
          
          player.hasPlayed = true
          player.hasWon = won

          if (won) {
            player.balance += game.pot
            game.pot = 0
            game.gameState = InBetweenGameState.RESULTS
          } else {
            player.balance -= game.currentBet
            game.pot += game.currentBet
            game.currentBet *= 2
          }

          io.to(roomCode).emit('inbetween-update', game)
          nextInBetweenPlayer(game)
          return
        }
      }
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)

      // Remove player from room
      rooms.forEach((room) => {
        const playerIndex = room.players.findIndex((p) => p.id === socket.id)
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1)
          io.to(room.code).emit('room-update', room)
        }
      })

      // Remove player from blackjack game
      blackjackGames.forEach((game) => {
        const playerIndex = game.players.findIndex((p) => p.id === socket.id)
        if (playerIndex !== -1) {
          game.players.splice(playerIndex, 1)
          io.to(game.code).emit('blackjack-update', game)
        }
      })

      // Remove player from poker game
      pokerGames.forEach((game) => {
        const playerIndex = game.players.findIndex((p) => p.id === socket.id)
        if (playerIndex !== -1) {
          game.players.splice(playerIndex, 1)
          io.to(game.code).emit('poker-update', game)
        }
      })

      // Remove player from inbetween game
      inBetweenGames.forEach((game) => {
        const playerIndex = game.players.findIndex((p) => p.id === socket.id)
        if (playerIndex !== -1) {
          game.players.splice(playerIndex, 1)
          io.to(game.code).emit('inbetween-update', game)
        }
      })
    })
  })

  function startBettingPhase(room: Room) {
    room.gameState = GameState.BETTING
    room.canBet = true
    io.to(room.code).emit('room-update', room)

    // Auto-spin after 20 seconds if no one spins
    setTimeout(() => {
      if (room.canBet && room.gameState === GameState.BETTING) {
        const winningNumber = spinWheel()
        room.spinResult = winningNumber
        room.gameState = GameState.RESULTS
        room.canBet = false

        room.currentBets.forEach((bet) => {
          const winnings = calculateWinnings(bet, winningNumber)
          const player = room.players.find((p) => p.id === bet.playerId)
          if (player) {
            player.balance += winnings
          }
        })

        room.players.forEach((p) => (p.bets = []))
        room.currentBets = []

        io.to(room.code).emit('room-update', room)

        setTimeout(() => {
          room.spinResult = undefined
          startBettingPhase(room)
        }, 5000)
      }
    }, 20000)
  }

  function startBlackjackBetting(game: BlackjackGame) {
    game.gameState = BlackjackGameState.BETTING
    game.canBet = true
    io.to(game.code).emit('blackjack-update', game)
  }

  function startBlackjackGame(game: BlackjackGame) {
    game.gameState = BlackjackGameState.PLAYING
    game.canBet = false
    game.deck = createDeck()

    // Deal initial cards
    game.players.forEach((player) => {
      player.hand = []
      player.isStanding = false
      player.hasBlackjack = false
      player.isBusted = false
      
      const card1 = dealCard(game.deck)
      const card2 = dealCard(game.deck)
      if (card1 && card2) {
        player.hand.push(card1, card2)
        player.hasBlackjack = hasBlackjack(player.hand)
      }
    })

    // Deal dealer cards
    game.dealerHand = []
    const dealerCard1 = dealCard(game.deck)
    const dealerCard2 = dealCard(game.deck)
    if (dealerCard1 && dealerCard2) {
      game.dealerHand.push(dealerCard1, dealerCard2)
    }

    game.currentPlayerIndex = 0
    io.to(game.code).emit('blackjack-update', game)
  }

  function nextPlayer(game: BlackjackGame) {
    game.currentPlayerIndex++
    
    // Check if all players are done
    if (game.currentPlayerIndex >= game.players.length) {
      dealerTurn(game)
    } else {
      io.to(game.code).emit('blackjack-update', game)
    }
  }

  function dealerTurn(game: BlackjackGame) {
    game.gameState = BlackjackGameState.DEALER_TURN
    io.to(game.code).emit('blackjack-update', game)

    setTimeout(() => {
      // Dealer must hit on 16 or less
      while (calculateHandValue(game.dealerHand) < 17) {
        const card = dealCard(game.deck)
        if (card) {
          game.dealerHand.push(card)
        }
      }

      // Calculate results
      game.gameState = BlackjackGameState.RESULTS
      const dealerValue = calculateHandValue(game.dealerHand)
      const dealerBusted = dealerValue > 21

      game.players.forEach((player) => {
        if (player.isBusted) {
          // Player loses
          return
        }

        if (player.hasBlackjack) {
          // Blackjack pays 3:2
          player.balance += player.bet + Math.floor(player.bet * 1.5)
          return
        }

        const playerValue = calculateHandValue(player.hand)

        if (dealerBusted) {
          // Dealer busted, player wins
          player.balance += player.bet * 2
        } else if (playerValue > dealerValue) {
          // Player wins
          player.balance += player.bet * 2
        } else if (playerValue === dealerValue) {
          // Push
          player.balance += player.bet
        }
        // Player loses - no payout
      })

      io.to(game.code).emit('blackjack-update', game)

      // Start next round after 5 seconds
      setTimeout(() => {
        game.currentPlayerIndex = -1
        game.dealerHand = []
        game.players.forEach((p) => {
          p.hand = []
          p.bet = 0
          p.isStanding = false
          p.hasBlackjack = false
          p.isBusted = false
        })
        startBlackjackBetting(game)
      }, 5000)
    }, 2000)
  }

  function startPokerGame(game: PokerGame) {
    game.deck = createPokerDeck()
    game.communityCards = []
    game.pot = 0
    game.currentBet = 0
    game.gameState = PokerGameState.PREFLOP
    game.currentRound = PokerRound.DEALING

    // Reset all players
    game.players.forEach((player) => {
      player.hand = []
      player.bet = 0
      player.totalBet = 0
      player.isFolded = false
      player.isAllIn = false
      player.hasActed = false
    })

    // Deal cards
    for (let i = 0; i < 2; i++) {
      game.players.forEach((player) => {
        const card = dealPokerCard(game.deck)
        if (card) player.hand.push(card)
      })
    }

    // Post blinds (simplified - small blind $5, big blind $10)
    const smallBlind = 5
    const bigBlind = 10

    if (game.players.length >= 2) {
      const sbPlayer = game.players[game.dealerIndex]
      const bbPlayer = game.players[(game.dealerIndex + 1) % game.players.length]

      sbPlayer.balance -= smallBlind
      sbPlayer.bet = smallBlind
      sbPlayer.totalBet = smallBlind
      game.pot += smallBlind

      bbPlayer.balance -= bigBlind
      bbPlayer.bet = bigBlind
      bbPlayer.totalBet = bigBlind
      game.pot += bigBlind

      game.currentBet = bigBlind
    }

    game.currentPlayerIndex = (game.dealerIndex + 2) % game.players.length
    game.currentRound = PokerRound.BETTING

    io.to(game.code).emit('poker-update', game)
  }

  function nextPokerPlayer(game: PokerGame) {
    // Check if all players have acted
    const activePlayers = game.players.filter((p) => !p.isFolded && !p.isAllIn)
    const hasActed = activePlayers.filter((p) => p.hasActed).length

    if (hasActed >= activePlayers.length && game.currentRound === PokerRound.BETTING) {
      // Move to next round
      advancePokerRound(game)
      return
    }

    // Move to next player
    do {
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length
    } while (game.players[game.currentPlayerIndex].isFolded || game.players[game.currentPlayerIndex].isAllIn)

    io.to(game.code).emit('poker-update', game)
  }

  function advancePokerRound(game: PokerGame) {
    // Reset hasActed for all players
    game.players.forEach((p) => {
      p.hasActed = false
      p.bet = 0
    })

    if (game.gameState === PokerGameState.PREFLOP) {
      // Deal flop
      game.gameState = PokerGameState.FLOP
      for (let i = 0; i < 3; i++) {
        const card = dealPokerCard(game.deck)
        if (card) game.communityCards.push(card)
      }
    } else if (game.gameState === PokerGameState.FLOP) {
      // Deal turn
      game.gameState = PokerGameState.TURN
      const card = dealPokerCard(game.deck)
      if (card) game.communityCards.push(card)
    } else if (game.gameState === PokerGameState.TURN) {
      // Deal river
      game.gameState = PokerGameState.RIVER
      const card = dealPokerCard(game.deck)
      if (card) game.communityCards.push(card)
    } else if (game.gameState === PokerGameState.RIVER) {
      // Showdown
      game.gameState = PokerGameState.SHOWDOWN
      determinePokerWinner(game)
      return
    }

    game.currentBet = 0
    game.currentPlayerIndex = (game.dealerIndex + 1) % game.players.length
    while (game.players[game.currentPlayerIndex].isFolded || game.players[game.currentPlayerIndex].isAllIn) {
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length
    }

    io.to(game.code).emit('poker-update', game)
  }

  function determinePokerWinner(game: PokerGame) {
    // Simplified winner determination - just split pot among non-folded players
    const activePlayers = game.players.filter((p) => !p.isFolded)
    const winningsPerPlayer = Math.floor(game.pot / activePlayers.length)

    activePlayers.forEach((player) => {
      player.balance += winningsPerPlayer
    })

    game.gameState = PokerGameState.RESULTS
    io.to(game.code).emit('poker-update', game)

    // Start next round after 5 seconds
    setTimeout(() => {
      game.dealerIndex = (game.dealerIndex + 1) % game.players.length
      startPokerGame(game)
    }, 5000)
  }

  function startInBetweenGame(game: InBetweenGame) {
    game.deck = createInBetweenDeck()
    game.pot = 0
    game.currentBet = 1
    game.gameState = InBetweenGameState.DEALING

    // Reset all players
    game.players.forEach((player) => {
      player.hand = []
      player.thirdCard = undefined
      player.bet = 0
      player.hasPlayed = false
      player.hasWon = false
      player.hasFolded = false
      player.isChoosingHigher = null
    })

    // Deal 2 cards to each player
    for (let i = 0; i < 2; i++) {
      game.players.forEach((player) => {
        const card = dealInBetweenCard(game.deck)
        if (card) player.hand.push(card)
      })
    }

    game.gameState = InBetweenGameState.CHOOSING
    game.currentPlayerIndex = 0

    io.to(game.code).emit('inbetween-update', game)
  }

  function nextInBetweenPlayer(game: InBetweenGame) {
    // Check if someone won
    if (game.gameState === InBetweenGameState.RESULTS) {
      // Start next round after 5 seconds
      setTimeout(() => {
        game.round++
        startInBetweenGame(game)
      }, 5000)
      return
    }

    // Move to next player
    do {
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length
    } while (game.players[game.currentPlayerIndex].hasFolded || game.players[game.currentPlayerIndex].hasPlayed)

    // Check if all players have acted
    const allActed = game.players.every((p) => p.hasFolded || p.hasPlayed)
    if (allActed) {
      // No one won, start new round
      game.gameState = InBetweenGameState.RESULTS
      setTimeout(() => {
        game.round++
        game.currentBet = 1
        startInBetweenGame(game)
      }, 5000)
      return
    }

    io.to(game.code).emit('inbetween-update', game)
  }

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})


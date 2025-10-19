export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
  value: number
}

export interface BlackjackPlayer {
  id: string
  name: string
  balance: number
  hand: Card[]
  bet: number
  isStanding: boolean
  hasBlackjack: boolean
  isBusted: boolean
}

export interface BlackjackGame {
  code: string
  players: BlackjackPlayer[]
  dealerHand: Card[]
  currentPlayerIndex: number
  gameState: BlackjackGameState
  canBet: boolean
  deck: Card[]
}

export enum BlackjackGameState {
  WAITING = 'WAITING',
  BETTING = 'BETTING',
  PLAYING = 'PLAYING',
  DEALER_TURN = 'DEALER_TURN',
  RESULTS = 'RESULTS',
}

export enum BlackjackAction {
  HIT = 'HIT',
  STAND = 'STAND',
  DOUBLE = 'DOUBLE',
}


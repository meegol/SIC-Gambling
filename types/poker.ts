export interface PokerPlayer {
  id: string
  name: string
  balance: number
  hand: Card[]
  bet: number
  totalBet: number
  isFolded: boolean
  isAllIn: boolean
  hasActed: boolean
}

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
}

export interface PokerGame {
  code: string
  players: PokerPlayer[]
  communityCards: Card[]
  pot: number
  currentBet: number
  dealerIndex: number
  currentPlayerIndex: number
  gameState: PokerGameState
  currentRound: PokerRound
  deck: Card[]
}

export enum PokerGameState {
  WAITING = 'WAITING',
  PREFLOP = 'PREFLOP',
  FLOP = 'FLOP',
  TURN = 'TURN',
  RIVER = 'RIVER',
  SHOWDOWN = 'SHOWDOWN',
  RESULTS = 'RESULTS',
}

export enum PokerRound {
  WAITING = 'WAITING',
  BETTING = 'BETTING',
  DEALING = 'DEALING',
}

export enum PokerAction {
  FOLD = 'FOLD',
  CHECK = 'CHECK',
  CALL = 'CALL',
  RAISE = 'RAISE',
  ALL_IN = 'ALL_IN',
}


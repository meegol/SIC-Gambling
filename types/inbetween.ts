export interface InBetweenCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades'
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
  value: number
}

export interface InBetweenPlayer {
  id: string
  name: string
  balance: number
  hand: InBetweenCard[]
  thirdCard?: InBetweenCard
  bet: number
  hasPlayed: boolean
  hasWon: boolean
  hasFolded: boolean
  isChoosingHigher: boolean | null // null = not applicable, true/false = choice made
}

export interface InBetweenGame {
  code: string
  players: InBetweenPlayer[]
  pot: number
  currentBet: number
  currentPlayerIndex: number
  gameState: InBetweenGameState
  deck: InBetweenCard[]
  round: number
}

export enum InBetweenGameState {
  WAITING = 'WAITING',
  DEALING = 'DEALING',
  CHOOSING = 'CHOOSING', // Players choosing to play or fold
  PLAYING = 'PLAYING', // Active player drawing card
  HIGHER_LOWER = 'HIGHER_LOWER', // Player needs to choose higher or lower
  RESULTS = 'RESULTS',
}


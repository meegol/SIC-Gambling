export interface Player {
  id: string
  name: string
  balance: number
  bets: Bet[]
}

export interface Bet {
  id: string
  playerId: string
  type: BetType
  amount: number
  numbers: number[]
}

export enum BetType {
  STRAIGHT_UP = 'STRAIGHT_UP', // Single number
  RED = 'RED',
  BLACK = 'BLACK',
  EVEN = 'EVEN',
  ODD = 'ODD',
  LOW = 'LOW', // 1-18
  HIGH = 'HIGH', // 19-36
  DOZEN_FIRST = 'DOZEN_FIRST', // 1-12
  DOZEN_SECOND = 'DOZEN_SECOND', // 13-24
  DOZEN_THIRD = 'DOZEN_THIRD', // 25-36
  COLUMN_FIRST = 'COLUMN_FIRST', // 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
  COLUMN_SECOND = 'COLUMN_SECOND', // 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
  COLUMN_THIRD = 'COLUMN_THIRD', // 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
}

export interface Room {
  code: string
  players: Player[]
  gameState: GameState
  currentBets: Bet[]
  spinResult?: number
  canBet: boolean
}

export enum GameState {
  WAITING = 'WAITING',
  BETTING = 'BETTING',
  SPINNING = 'SPINNING',
  RESULTS = 'RESULTS',
}

export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
export const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

export const BET_PAYOUTS: Record<BetType, number> = {
  [BetType.STRAIGHT_UP]: 35,
  [BetType.RED]: 1,
  [BetType.BLACK]: 1,
  [BetType.EVEN]: 1,
  [BetType.ODD]: 1,
  [BetType.LOW]: 1,
  [BetType.HIGH]: 1,
  [BetType.DOZEN_FIRST]: 2,
  [BetType.DOZEN_SECOND]: 2,
  [BetType.DOZEN_THIRD]: 2,
  [BetType.COLUMN_FIRST]: 2,
  [BetType.COLUMN_SECOND]: 2,
  [BetType.COLUMN_THIRD]: 2,
}

export const COLUMN_NUMBERS = {
  [BetType.COLUMN_FIRST]: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  [BetType.COLUMN_SECOND]: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [BetType.COLUMN_THIRD]: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
}

export const DOZEN_NUMBERS = {
  [BetType.DOZEN_FIRST]: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  [BetType.DOZEN_SECOND]: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
  [BetType.DOZEN_THIRD]: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
}


import { Bet, BetType, RED_NUMBERS, BLACK_NUMBERS, COLUMN_NUMBERS, DOZEN_NUMBERS } from '@/types/game'

export function calculateWinnings(bet: Bet, winningNumber: number): number {
  const { type, numbers } = bet

  switch (type) {
    case BetType.STRAIGHT_UP:
      return numbers.includes(winningNumber) ? bet.amount * 36 : 0

    case BetType.RED:
      return RED_NUMBERS.includes(winningNumber) ? bet.amount * 2 : 0

    case BetType.BLACK:
      return BLACK_NUMBERS.includes(winningNumber) ? bet.amount * 2 : 0

    case BetType.EVEN:
      return winningNumber !== 0 && winningNumber % 2 === 0 ? bet.amount * 2 : 0

    case BetType.ODD:
      return winningNumber !== 0 && winningNumber % 2 === 1 ? bet.amount * 2 : 0

    case BetType.LOW:
      return winningNumber >= 1 && winningNumber <= 18 ? bet.amount * 2 : 0

    case BetType.HIGH:
      return winningNumber >= 19 && winningNumber <= 36 ? bet.amount * 2 : 0

    case BetType.DOZEN_FIRST:
    case BetType.DOZEN_SECOND:
    case BetType.DOZEN_THIRD:
      return DOZEN_NUMBERS[type].includes(winningNumber) ? bet.amount * 3 : 0

    case BetType.COLUMN_FIRST:
    case BetType.COLUMN_SECOND:
    case BetType.COLUMN_THIRD:
      return COLUMN_NUMBERS[type].includes(winningNumber) ? bet.amount * 3 : 0

    default:
      return 0
  }
}

export function spinWheel(): number {
  return Math.floor(Math.random() * 37) // 0-36
}

export function getNumberColor(number: number): 'red' | 'black' | 'green' {
  if (number === 0) return 'green'
  return RED_NUMBERS.includes(number) ? 'red' : 'black'
}


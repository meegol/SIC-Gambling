export enum GameType {
  ROULETTE = 'ROULETTE',
  BLACKJACK = 'BLACKJACK',
  POKER = 'POKER',
}

export interface GameSelection {
  type: GameType
  name: string
  description: string
  icon: string
}

export const GAME_SELECTIONS: GameSelection[] = [
  {
    type: GameType.ROULETTE,
    name: 'Roulette',
    description: 'Spin the wheel and bet on numbers',
    icon: '🎰',
  },
  {
    type: GameType.BLACKJACK,
    name: 'Blackjack',
    description: 'Beat the dealer without going over 21',
    icon: '🃏',
  },
  {
    type: GameType.POKER,
    name: 'Texas Hold\'em',
    description: 'Classic poker with friends',
    icon: '🎴',
  },
]


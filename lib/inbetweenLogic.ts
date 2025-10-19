import { InBetweenCard } from '@/types/inbetween'

export function createDeck(): InBetweenCard[] {
  const suits: InBetweenCard['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks: InBetweenCard['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  
  const deck: InBetweenCard[] = []
  
  for (const suit of suits) {
    for (const rank of ranks) {
      let value: number
      if (rank === 'A') {
        value = 1
      } else if (['J', 'Q', 'K'].includes(rank)) {
        value = 10
      } else {
        value = parseInt(rank)
      }
      
      deck.push({ suit, rank, value })
    }
  }
  
  return shuffleDeck(deck)
}

export function shuffleDeck(deck: InBetweenCard[]): InBetweenCard[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function dealCard(deck: InBetweenCard[]): InBetweenCard | null {
  if (deck.length === 0) return null
  return deck.pop() || null
}

export function getCardDisplay(card: InBetweenCard): string {
  const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }
  
  return `${card.rank}${suitSymbols[card.suit]}`
}

export function getCardColor(card: InBetweenCard): string {
  return card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-white'
}

export function isCardBetween(card1: InBetweenCard, card2: InBetweenCard, card3: InBetweenCard): boolean {
  const val1 = card1.value
  const val2 = card2.value
  const val3 = card3.value
  
  const min = Math.min(val1, val2)
  const max = Math.max(val1, val2)
  
  return val3 > min && val3 < max
}

export function areCardsEqual(card1: InBetweenCard, card2: InBetweenCard): boolean {
  return card1.value === card2.value
}

export function isCardHigher(card1: InBetweenCard, card2: InBetweenCard): boolean {
  return card1.value > card2.value
}


import { Card, BlackjackAction } from '@/types/blackjack'

export function createDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  
  const deck: Card[] = []
  
  for (const suit of suits) {
    for (const rank of ranks) {
      let value: number
      if (rank === 'A') {
        value = 11 // Will be adjusted based on total
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

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function calculateHandValue(hand: Card[]): number {
  let total = 0
  let aces = 0
  
  for (const card of hand) {
    if (card.rank === 'A') {
      aces++
      total += 11
    } else {
      total += card.value
    }
  }
  
  // Adjust for aces
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  
  return total
}

export function dealCard(deck: Card[]): Card | null {
  if (deck.length === 0) return null
  return deck.pop() || null
}

export function hasBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && calculateHandValue(hand) === 21
}

export function isBusted(hand: Card[]): boolean {
  return calculateHandValue(hand) > 21
}

export function getCardDisplay(card: Card): string {
  const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  }
  
  return `${card.rank}${suitSymbols[card.suit]}`
}

export function getCardColor(card: Card): string {
  return card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-500' : 'text-white'
}


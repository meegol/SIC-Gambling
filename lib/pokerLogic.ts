import { Card, PokerAction } from '@/types/poker'

export function createDeck(): Card[] {
  const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades']
  const ranks: Card['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
  
  const deck: Card[] = []
  
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank })
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

export function dealCard(deck: Card[]): Card | null {
  if (deck.length === 0) return null
  return deck.pop() || null
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

// Simplified hand ranking (for demo purposes)
export function evaluateHand(hand: Card[], communityCards: Card[]): string {
  const allCards = [...hand, ...communityCards]
  if (allCards.length < 5) return 'Incomplete'
  
  // This is a simplified version - full poker hand evaluation is complex
  return 'High Card' // Placeholder
}


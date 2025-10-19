export function getCardImagePath(card: { suit: string; rank: string }, size: 'small' | 'medium' | 'large' = 'medium'): string {
  // Map suit names to file names (files use singular "Diamond" not "Diamonds")
  const suitMap: Record<string, string> = {
    'hearts': 'Hearts',
    'diamonds': 'Diamond',
    'clubs': 'Clubs',
    'spades': 'Spades'
  }
  const suit = suitMap[card.suit] || card.suit.charAt(0).toUpperCase() + card.suit.slice(1)
  
  // Map rank to number
  let rankNum: string
  if (card.rank === 'A') {
    rankNum = '1'
  } else if (card.rank === 'J') {
    rankNum = '11'
  } else if (card.rank === 'Q') {
    rankNum = '12'
  } else if (card.rank === 'K') {
    rankNum = '13'
  } else {
    rankNum = card.rank
  }
  
  return `/${size}/${suit} ${rankNum}.png`
}

export function getCardBackImagePath(style: 'blue' | 'red' | 'grey' = 'blue', size: 'small' | 'medium' | 'large' = 'medium'): string {
  const styleNum = Math.floor(Math.random() * 2) + 1 // Random between 1 and 2
  return `/${size}/Back ${style.charAt(0).toUpperCase() + style.slice(1)} ${styleNum}.png`
}


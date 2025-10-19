'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import GameSelection from './game-selection'

export default function RoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomCode = params.code as string
  const playerName = searchParams.get('name') || 'Player'

  return <GameSelection roomCode={roomCode} playerName={playerName} />
}

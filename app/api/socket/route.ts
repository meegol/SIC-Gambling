import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { NextRequest } from 'next/server'

// This will be handled by the custom server
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  return new Response('Socket.io server', { status: 200 })
}


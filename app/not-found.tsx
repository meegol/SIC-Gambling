export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Room not found</p>
        <a
          href="/"
          className="bg-gradient-to-r from-casino-gold to-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg hover:from-yellow-400 hover:to-casino-gold transition-all inline-block"
        >
          Go Home
        </a>
      </div>
    </div>
  )
}


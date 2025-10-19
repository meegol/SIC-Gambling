'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-gray-400 mb-8">{error.message}</p>
        <button
          onClick={reset}
          className="bg-gradient-to-r from-casino-gold to-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg hover:from-yellow-400 hover:to-casino-gold transition-all"
        >
          Try again
        </button>
      </div>
    </div>
  )
}


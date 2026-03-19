import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold gradient-text">404</h1>
      <p className="text-text-secondary mt-2">Pagina niet gevonden</p>
      <Link
        href="/"
        className="mt-4 px-4 py-2 rounded-lg bg-accent/10 text-accent border border-accent/30 text-sm hover:bg-accent/20 transition-all"
      >
        Terug naar home
      </Link>
    </div>
  )
}

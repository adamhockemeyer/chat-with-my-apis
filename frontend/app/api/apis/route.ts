import { NextResponse } from 'next/server'

export async function GET() {
  // In a real-world scenario, this data would likely come from a database
  const apis = [
    { id: 'weather', name: 'Weather API' },
    { id: 'stocks', name: 'Stock Market API' },
    { id: 'news', name: 'News API' },
    { id: 'currency', name: 'Currency Exchange API' },
    { id: 'movie', name: 'Movie Database API' },
  ]

  return NextResponse.json(apis)
}


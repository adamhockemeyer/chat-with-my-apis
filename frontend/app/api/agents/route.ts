import { NextResponse } from 'next/server'

export async function GET() {
  // In a real-world scenario, this data would likely come from a database
  const agents = [
    { id: 'weather', name: 'Weather Agent', description: 'Specialized in providing weather information and forecasts.' },
    { id: 'stocks', name: 'Stock Market Agent', description: 'Offers insights and analysis on stock market trends.' },
  ]

  return NextResponse.json(agents)
}


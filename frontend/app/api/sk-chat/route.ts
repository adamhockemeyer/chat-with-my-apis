import { NextRequest, NextResponse } from 'next/server'
import { StreamingTextResponse, LangChainStream } from 'ai'

const SK_API_ENDPOINT = process.env.SK_API_ENDPOINT || 'https://your-sk-api-endpoint.com'

export async function POST(req: NextRequest) {
  try {
    const { messages, agentName, apis } = await req.json()

    const payload = {
      messages,
      ...(agentName ? { agentName } : { apis }),
    }

    const { stream, handlers } = LangChainStream()

    // Start the request to the SK API
    fetch(`${SK_API_ENDPOINT}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error(`SK API responded with status ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          handlers.done()
          break
        }
        const text = new TextDecoder().decode(value)
        handlers.queue(text)
      }
    }).catch((e) => {
      handlers.error(e)
    })

    return new StreamingTextResponse(stream)
  } catch (error) {
    console.error('Error in sk-chat route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}


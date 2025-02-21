// import { redirect } from 'next/navigation'

// export default function Home() {
//   redirect('/chat/general')
// }

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAgents } from './context/AgentsContext'
import ChatSkeleton from './components/ChatSkeleton'

export default function Home() {
  const { agents } = useAgents()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (agents.length > 0) {
      // Uses generic chat agent if available as the default 'page', otherwise uses the first agent
      const genericChatAgent = agents.find(agent => agent.id === (process.env.GENERIC_CHAT_APIM_PRODUCT_ID ?? 'generic-chat-agent'))

      if (genericChatAgent) {
        router.push(`/chat/${genericChatAgent.id}`)
      } else if (agents.length > 0) {
        console.log('GENERIC_CHAT_APIM_PRODUCT_ID not found, using first agent instead')
        router.push(`/chat/${agents[0].id}`)
      }
      else {
        router.push('/chat/not-found')
      }
    }
    setLoading(false)
  }, [agents, router])

  if (loading) {
    return <ChatSkeleton />
  }

  return <ChatSkeleton />;
}
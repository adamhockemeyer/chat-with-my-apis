"use client";

import React, { useState, useEffect, createContext, useContext } from 'react'
import { fetchAgentProducts } from '../actions/apis'
import { Bot, MessageSquare } from 'lucide-react'

interface Agent {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  apis: string[]
}

interface AgentsContextType {
  agents: Agent[]
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>
}

export const AgentsContext = createContext<AgentsContextType>({
  agents: [],
  setAgents: () => { }
})

// If no env variable found, default to 'generic-chat-agent'
const GENERIC_CHAT_PRODUCT_ID = process.env.GENERIC_CHAT_APIM_PRODUCT_ID ?? 'generic-chat-agent'

export function AgentsProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([])

  useEffect(() => {
    async function fetchAgents() {
      try {
        const response = await fetchAgentProducts()
        if (!response) throw new Error('Failed to fetch agents')

        // Create an array where matching IDs use the MessageSquare icon, others use Bot
        const mappedAgents = response.map((product: any) => ({
          id: product.product_id,
          name: product.name,
          description: 'Agent description',
          icon:
            product.product_id === GENERIC_CHAT_PRODUCT_ID
              ? <MessageSquare size={20} />
              : <Bot size={20} />,
          apis: []
        }))

        // Sort so that the product matching GENERIC_CHAT_PRODUCT_ID appears first
        mappedAgents.sort((a, b) => {
          if (a.id === GENERIC_CHAT_PRODUCT_ID) return -1
          if (b.id === GENERIC_CHAT_PRODUCT_ID) return 1
          return 0
        })

        setAgents(mappedAgents)
      } catch (error) {
        console.error('Error fetching agents:', error)
      }
    }
    fetchAgents()
  }, [])

  return (
    <AgentsContext.Provider value={{ agents, setAgents }}>
      {children}
    </AgentsContext.Provider>
  )
}

export function useAgents() {
  return useContext(AgentsContext)
}
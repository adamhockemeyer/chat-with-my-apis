"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Bot, PlusCircle, FileText, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { AddAgentModal } from './AddAgentModal'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
//import { fetchAgentProducts, fetchApisByProductId, ProductResponse } from "../actions/apis"
import { useAgents } from '../context/AgentsContext'
import Skeleton from './Skeleton'


type API = {
  id: string
  name: string
}

type Agent = {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  apis: string[]
}


export default function LeftNav() {
  //const [agents, setAgents] = useState<Agent[]>([])
  const { agents, setAgents } = useAgents()
  const [isAddAgentModalOpen, setIsAddAgentModalOpen] = useState(false)
  const [agentToRemove, setAgentToRemove] = useState<string | null>(null)
  const [availableAPIs, setAvailableAPIs] = useState<API[]>([])
  const pathname = usePathname()
  const [expandedAgents, setExpandedAgents] = useState<string[]>([])


  const handleAddAgent = (newAgent: Omit<Agent, 'icon'>) => {
    const agentWithIcon: Agent = {
      ...newAgent,
      icon: <Bot size={20} />,
    }
    setAgents(prevAgents => [...prevAgents, agentWithIcon])
  }

  const handleRemoveAgent = (agentId: string) => {
    setAgents(prevAgents => prevAgents.filter(agent => agent.id !== agentId))
    setAgentToRemove(null)
  }

  const toggleAgentExpansion = (agentId: string) => {
    setExpandedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  return (
    <nav className="w-64 bg-gray-100 p-4 h-full overflow-y-auto flex flex-col">
      <ul className="space-y-2 flex-grow">
        {agents.length === 0 ? (
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        ) : (
          agents.map((agent) => (
            <li key={agent.id}>
              <div
                className={`flex items-center justify-between text-gray-700 p-2 rounded-lg font-medium hover:bg-gray-200 ${pathname === `/chat/${agent.id}` ? 'bg-blue-100 text-blue-800' : ''
                  }`}
              >
                <Link
                  href={`/chat/${agent.id}`}
                  className="flex items-center space-x-3 flex-grow"
                >
                  {agent.icon}
                  <span>{agent.name}</span>
                </Link>
              </div>
            </li>
          ))
        )}
      </ul>
      <div className="mt-auto pt-4 border-t border-gray-200 space-y-4">
        {/* <Button variant="outline" className="w-full justify-start" onClick={() => setIsAddAgentModalOpen(true)}>
          <PlusCircle size={16} className="mr-2" />
          Add Agent
        </Button> */}
        <Link href="/terms-of-use" className="flex items-center text-sm text-gray-600 hover:text-gray-800">
          <FileText size={16} className="mr-2" />
          Terms of Use
        </Link>
      </div>
      {/* <AddAgentModal
        isOpen={isAddAgentModalOpen}
        onClose={() => setIsAddAgentModalOpen(false)}
        onAddAgent={handleAddAgent}
        availableAPIs={availableAPIs}
      />
      <Dialog open={agentToRemove !== null} onOpenChange={() => setAgentToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this agent? You can always add it back using the 'Add Agent' button.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgentToRemove(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => agentToRemove && handleRemoveAgent(agentToRemove)}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </nav>
  )
}


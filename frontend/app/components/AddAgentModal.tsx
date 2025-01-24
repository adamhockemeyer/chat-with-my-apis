import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { fetchAgentProducts, ProductResponse } from "../actions/apis"

type Agent = {
  id: string
  name: string
  description: string
  instructions?: string
  apis: string[]
}

type API = {
  id: string
  name: string
}

const defaultInstructions = `# Agent Instructions

This agent's main job is to [describe the main task or purpose].

## Guidelines:

- Break down complex problems into steps
- Decide if multiple steps are required to answer the question or solve the problem
- Provide clear and concise explanations
- Use relevant APIs and data sources when necessary
- Maintain a friendly and helpful tone

## Specific Instructions:

- [Add any specific instructions or guidelines for this agent]
- [Include any limitations or boundaries the agent should be aware of]
- [Mention any particular areas of expertise or focus]`

type AddAgentModalProps = {
  isOpen: boolean
  onClose: () => void
  onAddAgent: (agent: Agent) => void
  availableAPIs: API[]
}

export function AddAgentModal({ isOpen, onClose, onAddAgent, availableAPIs }: AddAgentModalProps) {
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new'>('existing')
  const [selectedExistingAgent, setSelectedExistingAgent] = useState<string>('')
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentDescription, setNewAgentDescription] = useState('')
  const [newAgentInstructions, setNewAgentInstructions] = useState(defaultInstructions)
  const [selectedAPIs, setSelectedAPIs] = useState<string[]>([])
  const [capabilities, setCapabilities] = useState({
    fileUpload: false,
    codeInterpreter: false,
  })
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([])

  useEffect(() => {
    async function fetchAgents() {
      try {
        //const response = await fetch('/api/agents')
        const response = await fetchAgentProducts()
        if (!response) {
          throw new Error('Failed to fetch agents')
        }

        setAvailableAgents(response.map((product: ProductResponse) => ({
          id: product.product_id,
          name: product.name,
          description: 'Agent description',
          apis: []
        })))
      } catch (error) {
        console.error('Error fetching agents:', error)
      }
    }

    fetchAgents()
  }, [])

  const handleSubmit = () => {
    if (selectedOption === 'existing') {
      const agent = availableAgents.find(a => a.id === selectedExistingAgent)
      if (agent) {
        onAddAgent(agent)
      }
    } else {
      const newAgent: Agent = {
        id: newAgentName.toLowerCase().replace(/\s+/g, '-'),
        name: newAgentName,
        description: newAgentDescription,
        instructions: newAgentInstructions,
        apis: selectedAPIs
      }
      onAddAgent(newAgent)
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Agent</DialogTitle>
          <DialogDescription>
            Select an existing agent or create a new one.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup value={selectedOption} onValueChange={(value: 'existing' | 'new') => setSelectedOption(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing">Select Existing Agent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="new" id="new" />
              <Label htmlFor="new">Create New Agent</Label>
            </div>
          </RadioGroup>

          {selectedOption === 'existing' && (
            <div className="grid gap-2">
              {availableAgents.map((agent) => (
                <div key={agent.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={agent.id}
                    name="existingAgent"
                    value={agent.id}
                    checked={selectedExistingAgent === agent.id}
                    onChange={() => setSelectedExistingAgent(agent.id)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <label htmlFor={agent.id} className="flex flex-col">
                    <span className="font-medium">{agent.name}</span>
                    <span className="text-sm text-gray-500">{agent.description}</span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {selectedOption === 'new' && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={newAgentDescription} onChange={(e) => setNewAgentDescription(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newAgentInstructions}
                  onChange={(e) => setNewAgentInstructions(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label>APIs</Label>
                {availableAPIs.map((api) => (
                  <div key={api.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={api.id}
                      checked={selectedAPIs.includes(api.id)}
                      onCheckedChange={(checked) => {
                        setSelectedAPIs(
                          checked
                            ? [...selectedAPIs, api.id]
                            : selectedAPIs.filter((id) => id !== api.id)
                        )
                      }}
                    />
                    <Label htmlFor={api.id}>{api.name}</Label>
                  </div>
                ))}
              </div>
              <div className="grid gap-2">
                <Label>Capabilities</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fileUpload"
                    checked={capabilities.fileUpload}
                    onCheckedChange={(checked) =>
                      setCapabilities(prev => ({ ...prev, fileUpload: checked as boolean }))
                    }
                  />
                  <Label htmlFor="fileUpload">File Upload</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="codeInterpreter"
                    checked={capabilities.codeInterpreter}
                    onCheckedChange={(checked) =>
                      setCapabilities(prev => ({ ...prev, codeInterpreter: checked as boolean }))
                    }
                  />
                  <Label htmlFor="codeInterpreter">Code Interpreter</Label>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Add Agent</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


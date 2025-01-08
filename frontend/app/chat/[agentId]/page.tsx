'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { X } from 'lucide-react'
import { ApiList } from '../../components/ApiList'
import { WelcomeMessage } from '../../components/WelcomeMessage'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'

export default function ChatPage() {
  const { agentId } = useParams()
  const [selectedApis, setSelectedApis] = useState<string[]>([])
  const [showApiList, setShowApiList] = useState(false)
  const [apiSearch, setApiSearch] = useState('')
  const [apiListPosition, setApiListPosition] = useState({ top: 0, left: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const [apis, setApis] = useState<Array<{ id: string; name: string }>>([])

  const isGeneralChat = agentId === 'general';

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading } = useChat({
    api: '/api/sk-chat',
    body: { agentName: isGeneralChat ? undefined : agentId, apis: isGeneralChat ? selectedApis : undefined },
    onResponse: (response) => {
      // This callback is called when the response starts streaming
      console.log('Streaming started', response)
    },
    onFinish: (message) => {
      // This callback is called when the streaming is finished
      console.log('Streaming finished', message)
    },
  })

  const filteredApis = apis.filter(api => 
    api.name.toLowerCase().includes(apiSearch.toLowerCase())
  )

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit(e)
  }

  const handleApiSelect = (apiName: string) => {
    if (selectedApis.includes(apiName)) {
      setSelectedApis(selectedApis.filter(api => api !== apiName))
    } else {
      setSelectedApis([...selectedApis, apiName])
    }
    closeApiList()
  }

  const handleRemoveApi = (apiName: string) => {
    setSelectedApis(selectedApis.filter(api => api !== apiName))
  }

  const closeApiList = () => {
    setShowApiList(false)
    setApiSearch('')
    if (inputRef.current) {
      const newInputValue = inputRef.current.value.replace(/@[^@]*$/, '')
      handleInputChange({ target: { value: newInputValue } } as React.ChangeEvent<HTMLInputElement>)
    }
    inputRef.current?.focus()
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '@' && isGeneralChat) {
      const rect = e.currentTarget.getBoundingClientRect()
      setApiListPosition({
        bottom: window.innerHeight - rect.top + 10,
        left: rect.left
      })
      setShowApiList(true)
      setApiSearch('')
    }
  }

  useEffect(() => {
    if (input.endsWith('@') && isGeneralChat) {
      const rect = inputRef.current?.getBoundingClientRect()
      if (rect) {
        setApiListPosition({
          bottom: window.innerHeight - rect.top + 10,
          left: rect.left
        })
        setShowApiList(true)
        setApiSearch('')
      }
    }
  }, [input, isGeneralChat])

  useEffect(() => {
    // Reset selected APIs when switching from general chat to an agent
    if (!isGeneralChat) {
      setSelectedApis([]);
    }
  }, [agentId, isGeneralChat]);

  useEffect(() => {
    async function fetchApis() {
      try {
        const response = await fetch('/api/apis')
        if (!response.ok) {
          throw new Error('Failed to fetch APIs')
        }
        const data = await response.json()
        setApis(data)
      } catch (error) {
        console.error('Error fetching APIs:', error)
      }
    }

    fetchApis()
  }, [])

  return (
    <div className="flex flex-col h-full p-4">
      <h1 className="text-2xl font-bold mb-4">
        {isGeneralChat ? "General Chat" : `Chat with ${agentId} Agent`}
      </h1>
      <Card className="flex-1 overflow-hidden mb-4">
        <CardContent className="h-full overflow-y-auto p-4">
          {messages.length === 0 ? (
            <WelcomeMessage isGeneralChat={isGeneralChat} />
          ) : (
            <>
              {messages.map(m => (
                <div key={m.id} className={`mb-4 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                    {m.role === 'user' ? (
                      m.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                          code: ({ node, inline, ...props }) => 
                            inline ? (
                              <code className="bg-gray-100 rounded px-1 py-0.5" {...props} />
                            ) : (
                              <code className="block bg-gray-100 rounded p-2 my-2 whitespace-pre-wrap" {...props} />
                            ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-left">
                  <span className="inline-block p-2 rounded-lg bg-gray-200 text-black">
                    AI is typing...
                  </span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <form onSubmit={onSubmit} className="flex flex-col space-y-2">
          {isGeneralChat && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedApis.map(api => (
                <span key={api} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                  {api}
                  <button
                    type="button"
                    onClick={() => handleRemoveApi(api)}
                    className="ml-1 text-blue-800 hover:text-blue-900 focus:outline-none"
                    aria-label={`Remove ${api}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              placeholder={isGeneralChat ? "Type your message... Use @ to select APIs" : "Type your message..."}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>Send</Button>
          </div>
        </form>
      </div>
      {showApiList && isGeneralChat && (
        <ApiList
          apis={filteredApis}
          selectedApis={selectedApis}
          apiSearch={apiSearch}
          onApiSelect={handleApiSelect}
          onApiSearchChange={setApiSearch}
          onClose={closeApiList}
          position={apiListPosition}
        />
      )}
    </div>
  )
}


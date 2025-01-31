'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { readStreamableValue } from 'ai/rsc';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { X, ThumbsUp, ThumbsDown, Bug } from 'lucide-react'
import { ApiList } from '../../components/ApiList'
import { WelcomeMessage } from '../../components/WelcomeMessage'
import { useParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import { TypingAnimation } from '../../components/TypingAnimation'
import { chat } from '../../actions/sk_chat'
import { fetchApisByProductId, fetchAgentProducts } from '../../actions/apis'

const GENERIC_CHAT_APIM_PRODUCT_ID = process.env.GENERIC_CHAT_APIM_PRODUCT_ID ?? 'generic-chat-agent';

type Feedback = 'up' | 'down' | null;

export default function ChatPage() {
  const { agentId } = useParams() as { agentId: string }
  const [selectedApis, setSelectedApis] = useState<Array<{ id: string; name: string }>>([]);
  const [showApiList, setShowApiList] = useState(false)
  const [apiSearch, setApiSearch] = useState('')
  const [apiListPosition, setApiListPosition] = useState({ top: 0, left: 0, bottom: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [apis, setApis] = useState<Array<{ id: string; name: string }>>([])
  const [feedback, setFeedback] = useState<{ [key: string]: Feedback }>({})


  const [input, setInput] = useState('')
  const [chatThreadId, setChatThreadId] = useState('')
  const [chatAgentId, setChatAgentId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string, traceId?: string | null}>>([])
  const [chatResponses, setChatResponses] = useState<string>("") // Declare the setChatResponses function
  const isGeneralChat = agentId === 'general';
  const [agentName, setAgentName] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input) return

    setIsLoading(true)
    try {


      // Add user message immediately
      setMessages((prev) => [...prev, { role: 'user', content: input }, { role: 'assistant', content: '' }])


      const productId = isGeneralChat ? GENERIC_CHAT_APIM_PRODUCT_ID : agentId;
      const { output, agentId: llmAgentId, threadId: llmThreadId, traceId } = await chat(input, chatThreadId, chatAgentId, productId, selectedApis.map((api) => api.id))

      setChatThreadId(llmThreadId)
      setChatAgentId(llmAgentId)

      console.log('traceId:', traceId);


      let fullResponse = ''
      const newEntryIndex = messages.length + 1 // index of the new “assistant” entry

      // Use readStreamableValue to get chunks from the SSE stream
      for await (const chunk of readStreamableValue(output)) {
        //console.log('chunk:', chunk)
        fullResponse += chunk
        setMessages((prev) =>
          prev.map((item, idx) =>
            idx === newEntryIndex ? { ...item, role: 'assistant', content: fullResponse, traceId: traceId } : item
          )
        )
      }
    } catch (error) {
      console.error('Error generating response:', error)
    } finally {
      setIsLoading(false)
      setInput('')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const filteredApis = apis.filter(api =>
    api.name.toLowerCase().includes(apiSearch.toLowerCase())
  )

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSubmit(e)
  }

  const handleApiSelect = (api: { id: string; name: string }) => {
    setSelectedApis((prev) => {
      // Avoid duplicates
      if (!prev.find((a) => a.id === api.id)) {
        return [...prev, api];
      }
      return prev;
    });
  };

  // const handleApiSelect = (apiName: string) => {
  //   if (selectedApis.includes(apiName)) {
  //     setSelectedApis(selectedApis.filter(api => api !== apiName))
  //   } else {
  //     setSelectedApis([...selectedApis, apiName])
  //   }

  //   closeApiList()
  // }

  const handleRemoveApi = (apiId: string) => {
    setSelectedApis(selectedApis.filter(api => api.id !== apiId))
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
        top: 0,
        bottom: window.innerHeight - rect.top + 10,
        left: rect.left
      })
      setShowApiList(true)
      setApiSearch('')
    }
  }

  const handleFeedback = (messageId: any, feedbackType: Feedback) => {
    setFeedback(prev => ({
      ...prev,
      [messageId]: feedbackType
    }))
    // Here you would typically send this feedback to your backend
    console.log(`Feedback for message ${messageId}: ${feedbackType}`)
  }

  const handleExplain = (messageId: number) => {
    setInput('Can you explain the steps you took to get this answer.');

    // Then wait briefly to ensure React state updates
    setTimeout(() => {
      console.log(formRef.current);
      formRef.current?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }, 100);
  };

  function handleDebug(index: number) {
    const traceId = messages[index]?.traceId;
    if (traceId) {
      alert(`Open Telemetry TraceID: ${traceId}`);
    } else {
      alert('No TraceID found for this message');
    }
  }

  useEffect(() => {
    if (input.endsWith('@') && isGeneralChat) {
      const rect = inputRef.current?.getBoundingClientRect()
      if (rect) {
        setApiListPosition({
          top: 0,
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
        const data = await fetchApisByProductId(GENERIC_CHAT_APIM_PRODUCT_ID)
        if (!data) {
          throw new Error(`Failed to fetch APIs for product id: ${GENERIC_CHAT_APIM_PRODUCT_ID}`)
        }

        setApis(data.map((api: any) => ({ id: api.api_id, name: api.name })))
      } catch (error) {
        console.error('Error fetching APIs:', error)
      }
    }

    fetchApis()
  }, [])

  useEffect(() => {
    async function fetchAgentName() {
      if (agentId === 'general') {
        setAgentName('General Chat');
      } else {
        try {
          const products = await fetchAgentProducts();
          const agent = products.find(product => product.product_id === agentId);
          if (agent) {
            setAgentName(agent.name);
          } else {
            setAgentName(agentId); // Fallback to agentId if name not found
          }
        } catch (error) {
          console.error('Error fetching agent name:', error);
          setAgentName(agentId); // Fallback to agentId in case of error
        }
      }
    }

    fetchAgentName();
  }, [agentId]);

  return (
    <div className="flex flex-col h-full p-4">
      <h1 className="text-2xl font-bold mb-4">
        {isGeneralChat ? "General Chat" : `${agentName}`}
      </h1>
      <Card className="flex-1 overflow-hidden mb-4">
        <CardContent className="h-full overflow-y-auto p-4">
          {messages.length === 0 ? (
            <WelcomeMessage isGeneralChat={isGeneralChat} />
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} className={`mb-4 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                    {m.role === 'user' ? (
                      m.content
                    ) : (
                      <>
                        {isLoading && m.content == '' && (
                          <div className="text-left">
                            <span className="inline-block p-2 rounded-lg bg-gray-200">
                              <TypingAnimation />
                            </span>
                          </div>
                        )}
                        <ReactMarkdown
                          components={{
                            p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                            code: ({ node, ...props }) => <code className="block bg-gray-100 rounded p-2 my-2 whitespace-pre-wrap" {...props} />
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                        {!isLoading && m.content != '' && (
                          <div className="flex justify-end mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExplain(i)}
                              className="text-gray-500"
                            >
                              Explain
                            </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDebug(i)}
                                className="text-gray-500"
                              >
                                <Bug size={16} />
                              </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(i, 'up')}
                              className={feedback[i] === 'up' ? 'text-green-500' : 'text-gray-500'}
                            >
                              <ThumbsUp size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFeedback(i, 'down')}
                              className={feedback[i] === 'down' ? 'text-red-500' : 'text-gray-500'}
                            >
                              <ThumbsDown size={16} />
                            </Button>
                          </div>
                        )}

                      </>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col space-y-2">
          {isGeneralChat && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedApis.map(api => (
                <span key={api.id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                  {api.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveApi(api.id)}
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
            <Button ref={submitButtonRef} type="submit" disabled={isLoading}>Send</Button>
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


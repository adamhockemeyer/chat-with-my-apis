import Link from 'next/link'

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">What is "Chat with my APIs"?</h2>
          <p>
            "Chat with my APIs" is an AI-powered chat interface that allows you to interact with various APIs through natural language conversations.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">How do I start a new chat?</h2>
          <p>
            You can start a new chat by clicking on the "New Chat" option under any of the available agents in the left sidebar.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">What are the different agents available?</h2>
          <p>
            We currently offer several agents, including a General Chat, Weather Agent, and Stock Market Agent. Each agent is specialized in its respective domain.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">How do I select APIs to use in my chat?</h2>
          <p>
            In a new General Chat, you can type '@' to bring up a list of available APIs. Select the APIs you want to use, and the AI will incorporate them into the conversation.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Can I access my previous chats?</h2>
          <p>
            Yes, your previous chats are saved and can be accessed from the left sidebar under each agent.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Is my data safe?</h2>
          <p>
            We take data privacy seriously. Please refer to our Terms of Use for more information on how we handle your data.
          </p>
        </div>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-blue-500 hover:underline">
          Return to Chat
        </Link>
      </div>
    </div>
  )
}


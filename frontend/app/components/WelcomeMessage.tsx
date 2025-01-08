import { MessageSquare } from 'lucide-react'

interface WelcomeMessageProps {
  isGeneralChat: boolean;
}

export function WelcomeMessage({ isGeneralChat }: WelcomeMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <MessageSquare size={64} className="text-blue-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Welcome to Chat with my APIs!</h2>
      <p className="text-gray-600 mb-4">Start your conversation by typing a message below.</p>
      {isGeneralChat && (
        <div className="text-sm text-gray-500">
          <p>💡 Tip: Use @ to select APIs in the general chat</p>
        </div>
      )}
    </div>
  )
}


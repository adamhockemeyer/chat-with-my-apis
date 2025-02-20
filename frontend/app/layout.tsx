

import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from './components/AuthProvider'
import { AuthenticationWrapper } from './components/AuthenticationWrapper'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Chat with my APIs',
  description: 'Chat with LLM enhanced by API knowledge',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AuthenticationWrapper>
              {children}
          </AuthenticationWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}


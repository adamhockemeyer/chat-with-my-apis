'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Settings, Bot, LogOut, HelpCircle } from 'lucide-react'
import { useMsal, useIsAuthenticated } from "@azure/msal-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { instance, accounts } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (accounts.length > 0) {
      setUser({
        name: accounts[0].name || '',
        email: accounts[0].username || '',
      })
    } else {
      setUser(null)
    }
  }, [accounts])

  const handleLogout = () => {
    instance.logoutRedirect().catch(e => {
      console.error(e)
    })
  }

  const initials = user?.name
    ? user.name.split(' ').map(name => name[0]).join('').toUpperCase()
    : ''

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Bot className="h-6 w-6 text-blue-500" />
        <h1 className="text-xl font-bold text-gray-800">Chat with my APIs</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Link href="/faq" className="text-gray-600 hover:text-gray-800">
          <HelpCircle size={20} />
        </Link>
        <button className="text-gray-600 hover:text-gray-800">
          <Settings size={20} />
        </button>
        {isAuthenticated && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {initials}
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}


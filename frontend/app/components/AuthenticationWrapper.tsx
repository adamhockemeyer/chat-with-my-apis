'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useMsal, useIsAuthenticated } from "@azure/msal-react"
import Header from './Header'
import LeftNav from './LeftNav'

interface AuthenticationWrapperProps {
  children: React.ReactNode
}

export function AuthenticationWrapper({ children }: AuthenticationWrapperProps) {
  const { instance } = useMsal()
  const isAuthenticated = useIsAuthenticated()
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const requireAuth = process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true'

    if (requireAuth && !isAuthenticated && pathname !== '/login') {
      router.push('/login')
    } else {
      setIsAuthChecked(true)
    }
  }, [instance, isAuthenticated, router, pathname])

  if (!isAuthChecked) {
    return <div>Loading...</div>
  }

  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}


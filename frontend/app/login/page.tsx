'use client'

import { useEffect } from 'react'
import { useMsal } from "@azure/msal-react"
import { msalLoginPopupRequest } from "../utils/msal-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const { instance, accounts } = useMsal()

  useEffect(() => {
    if (accounts.length > 0) {
      window.location.href = '/'
    }
  }, [accounts])

  const handleLogin = () => {
    instance.loginPopup(msalLoginPopupRequest).catch(e => {
      console.error(e)
    })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login Required</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center mb-6">Please log in to access the chat application.</p>
          <Button onClick={handleLogin} className="w-full">
            Log in with Microsoft
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


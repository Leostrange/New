"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { MainApp } from "@/components/main-app"
import { AndroidLibraryDemo } from "@/components/android-demo/android-library"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showAndroidDemo, setShowAndroidDemo] = useState(false)

  if (showAndroidDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Mr.Comic Android Demo</h1>
            <p className="text-muted-foreground">Демонстрация нативного Android интерфейса</p>
          </div>
          <AndroidLibraryDemo />
          <Button onClick={() => setShowAndroidDemo(false)} variant="outline">
            Вернуться к веб-версии
          </Button>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="p-4 text-center">
          <Button onClick={() => setShowAndroidDemo(true)} variant="outline">
            Показать Android Demo
          </Button>
        </div>
        <MainApp />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {showRegister ? (
          <RegisterForm onSuccess={() => setIsAuthenticated(true)} onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <LoginForm onSuccess={() => setIsAuthenticated(true)} onSwitchToRegister={() => setShowRegister(true)} />
        )}
      </div>
    </div>
  )
}

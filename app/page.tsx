"use client"

import { useState } from "react"
import { MainApp } from "@/components/main-app"
import { AndroidLibraryDemo } from "@/components/android-demo/android-library"
import { Button } from "@/components/ui/button"
import { MrComicShowcase } from "@/components/project-demo/mr-comic-showcase"

export default function HomePage() {
  const [showAndroidDemo, setShowAndroidDemo] = useState(false)
  const [showProjectResult, setShowProjectResult] = useState(true)

  if (showProjectResult) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-4 text-center border-b">
          <Button onClick={() => setShowProjectResult(false)} variant="outline">
            Перейти к приложению
          </Button>
        </div>
        <MrComicShowcase />
      </div>
    )
  }

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

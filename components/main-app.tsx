"use client"

import { useState } from "react"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import { LibraryView } from "@/components/library/library-view"
import { ReaderView } from "@/components/reader/reader-view"
import { TranslationsView } from "@/components/translations/translations-view"
import { SettingsView } from "@/components/settings/settings-view"

type ViewType = "home" | "library" | "reader" | "translations" | "settings"

export function MainApp() {
  const [currentView, setCurrentView] = useState<ViewType>("library")

  const renderView = () => {
    switch (currentView) {
      case "library":
        return <LibraryView onOpenReader={() => setCurrentView("reader")} />
      case "reader":
        return <ReaderView onClose={() => setCurrentView("library")} />
      case "translations":
        return <TranslationsView />
      case "settings":
        return <SettingsView />
      default:
        return <LibraryView onOpenReader={() => setCurrentView("reader")} />
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 overflow-hidden">{renderView()}</main>
      <BottomNavigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  )
}

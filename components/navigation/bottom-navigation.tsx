"use client"

import { Button } from "@/components/ui/button"
import { Home, Library, BookOpen, Languages, Settings } from "lucide-react"

type ViewType = "home" | "library" | "reader" | "translations" | "settings"

interface BottomNavigationProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function BottomNavigation({ currentView, onViewChange }: BottomNavigationProps) {
  const navItems = [
    { id: "home" as ViewType, icon: Home, label: "Домой" },
    { id: "library" as ViewType, icon: Library, label: "Библиотека" },
    { id: "reader" as ViewType, icon: BookOpen, label: "Чтение" },
    { id: "translations" as ViewType, icon: Languages, label: "Переводы" },
    { id: "settings" as ViewType, icon: Settings, label: "Настройки" },
  ]

  return (
    <nav className="border-t bg-card">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}

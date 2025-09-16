"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useTheme } from "next-themes"

interface ThemeSettingsProps {
  onBack: () => void
}

const themes = [
  {
    id: "light",
    name: "Light",
    preview: "bg-white border-gray-200",
    textColor: "text-gray-900",
  },
  {
    id: "dark",
    name: "Dark",
    preview: "bg-gray-900 border-gray-700",
    textColor: "text-gray-100",
  },
  {
    id: "sepia",
    name: "Sepia",
    preview: "bg-amber-50 border-amber-200",
    textColor: "text-amber-900",
  },
]

export function ThemeSettings({ onBack }: ThemeSettingsProps) {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState(theme || "light")

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId)
    setTheme(themeId)
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Темы</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {themes.map((themeOption) => (
          <Card
            key={themeOption.id}
            className={`cursor-pointer transition-all ${
              selectedTheme === themeOption.id ? "ring-2 ring-primary" : "hover:shadow-md"
            }`}
            onClick={() => handleThemeSelect(themeOption.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-20 rounded-lg border-2 ${themeOption.preview} flex items-center justify-center`}
                >
                  <div className="space-y-1">
                    <div className={`h-1 w-8 ${themeOption.textColor} opacity-60`}></div>
                    <div className={`h-1 w-6 ${themeOption.textColor} opacity-40`}></div>
                    <div className={`h-1 w-7 ${themeOption.textColor} opacity-60`}></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{themeOption.name}</h3>
                </div>
                {selectedTheme === themeOption.id && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

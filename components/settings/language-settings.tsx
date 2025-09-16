"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

interface LanguageSettingsProps {
  onBack: () => void
}

const languages = [
  { code: "en", name: "English" },
  { code: "ru", name: "Русский" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
]

export function LanguageSettings({ onBack }: LanguageSettingsProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("ru")

  const handleConfirm = () => {
    // TODO: Implement language change
    onBack()
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Language</h1>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {languages.map((language) => (
              <div
                key={language.code}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedLanguage(language.code)}
              >
                <div className="relative">
                  <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
                    {selectedLanguage === language.code && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                </div>
                <span className="font-medium">{language.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleConfirm} className="w-full">
        CONFIRM
      </Button>
    </div>
  )
}

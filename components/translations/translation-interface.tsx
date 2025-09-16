"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Camera, Languages } from "lucide-react"

interface TranslationInterfaceProps {
  onBack: () => void
}

export function TranslationInterface({ onBack }: TranslationInterfaceProps) {
  const [sourceLanguage, setSourceLanguage] = useState("english")
  const [targetLanguage, setTargetLanguage] = useState("russian")
  const [sourceText, setSourceText] = useState("")
  const [translatedText, setTranslatedText] = useState("")

  const handleTranslate = () => {
    // TODO: Implement actual translation
    setTranslatedText("Перевод появится здесь...")
  }

  const handleScan = () => {
    // TODO: Implement camera scanning
    setSourceText("Отсканированный текст появится здесь...")
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Перевод</h1>
      </div>

      {/* Language Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">С языка</label>
          <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="spanish">Español</SelectItem>
              <SelectItem value="french">Français</SelectItem>
              <SelectItem value="german">Deutsch</SelectItem>
              <SelectItem value="italian">Italiano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">На язык</label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="russian">Русский</SelectItem>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="spanish">Español</SelectItem>
              <SelectItem value="french">Français</SelectItem>
              <SelectItem value="german">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Input Text */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Исходный текст</h3>
            <Button variant="outline" size="sm" onClick={handleScan} className="gap-2 bg-transparent">
              <Camera className="h-4 w-4" />
              Сканировать
            </Button>
          </div>
          <Textarea
            placeholder="Введите текст для перевода..."
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>

      {/* Translation Output */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h3 className="font-medium">Перевод</h3>
          <Textarea
            placeholder="Перевод появится здесь..."
            value={translatedText}
            readOnly
            className="min-h-[120px] resize-none bg-muted"
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={handleTranslate} className="gap-2">
          <Languages className="h-4 w-4" />
          Перевести
        </Button>
        <Button variant="outline" onClick={handleScan} className="gap-2 bg-transparent">
          <Camera className="h-4 w-4" />
          Сканировать
        </Button>
      </div>
    </div>
  )
}

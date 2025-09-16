"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Languages, Scan, Settings } from "lucide-react"
import { OCRCropping } from "./ocr-cropping"
import { TranslationInterface } from "./translation-interface"

export function TranslationsView() {
  const [activeTab, setActiveTab] = useState<"settings" | "translate" | "ocr">("settings")
  const [ocrEngine, setOcrEngine] = useState("tesseract")
  const [apiKeys, setApiKeys] = useState({
    googleTranslate: "",
    deepL: "",
    openAI: "",
  })

  const handleApiKeyChange = (service: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [service]: value }))
  }

  if (activeTab === "ocr") {
    return <OCRCropping onBack={() => setActiveTab("settings")} />
  }

  if (activeTab === "translate") {
    return <TranslationInterface onBack={() => setActiveTab("settings")} />
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Переводы и OCR</h1>
        <p className="text-muted-foreground">Настройте параметры распознавания текста и перевода</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={() => setActiveTab("translate")} className="h-16 flex-col gap-2" variant="outline">
          <Languages className="h-6 w-6" />
          <span>Перевести</span>
        </Button>
        <Button onClick={() => setActiveTab("ocr")} className="h-16 flex-col gap-2" variant="outline">
          <Scan className="h-6 w-6" />
          <span>Сканировать</span>
        </Button>
      </div>

      {/* OCR Engine Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            OCR движок
          </CardTitle>
          <CardDescription>Выберите движок для распознавания текста</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={ocrEngine} onValueChange={setOcrEngine}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tesseract">Tesseract</SelectItem>
              <SelectItem value="mlkit">MLKit</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Translation Providers */}
      <Card>
        <CardHeader>
          <CardTitle>Поставщики перевода</CardTitle>
          <CardDescription>Настройте API ключи для сервисов перевода</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-api">Google Translate API</Label>
            <Input
              id="google-api"
              type="password"
              placeholder="Введите API ключ"
              value={apiKeys.googleTranslate}
              onChange={(e) => handleApiKeyChange("googleTranslate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deepl-api">DeepL API</Label>
            <Input
              id="deepl-api"
              type="password"
              placeholder="Введите API ключ"
              value={apiKeys.deepL}
              onChange={(e) => handleApiKeyChange("deepL", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="openai-api">OpenAI Whisper</Label>
            <Input
              id="openai-api"
              type="password"
              placeholder="Введите API ключ"
              value={apiKeys.openAI}
              onChange={(e) => handleApiKeyChange("openAI", e.target.value)}
            />
          </div>

          <Button className="w-full mt-4">Добавить API ключ</Button>
        </CardContent>
      </Card>

      {/* Offline Models */}
      <Card>
        <CardHeader>
          <CardTitle>Оффлайн модели</CardTitle>
          <CardDescription>Скачайте модели для работы без интернета</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Whisper</h4>
              <p className="text-sm text-muted-foreground">Модель для распознавания речи</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Скачать
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Trash2 } from "lucide-react"

interface OptimizationSettingsProps {
  onBack: () => void
}

export function OptimizationSettings({ onBack }: OptimizationSettingsProps) {
  const [performanceMode, setPerformanceMode] = useState("balanced")
  const [reduceAnimations, setReduceAnimations] = useState(false)
  const [asyncCoverLoading, setAsyncCoverLoading] = useState(true)
  const [compressImages, setCompressImages] = useState(true)
  const [nightModeOptimization, setNightModeOptimization] = useState(false)
  const [disableOnlineOnSlowInternet, setDisableOnlineOnSlowInternet] = useState(true)

  const handleClearCache = () => {
    // TODO: Implement cache clearing
    alert("Кэш очищен")
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Оптимизация</h1>
      </div>

      {/* Performance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Режим производительности</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { id: "energy", label: "Экономия энергии" },
            { id: "balanced", label: "Сбалансированный" },
            { id: "maximum", label: "Максимум" },
          ].map((mode) => (
            <div
              key={mode.id}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setPerformanceMode(mode.id)}
            >
              <div className="relative">
                <div className="w-4 h-4 border-2 border-primary rounded-full flex items-center justify-center">
                  {performanceMode === mode.id && <div className="w-2 h-2 bg-primary rounded-full" />}
                </div>
              </div>
              <span className="font-medium">{mode.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Optimization Options */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <OptimizationOption
            title="Уменьшить анимации"
            checked={reduceAnimations}
            onCheckedChange={setReduceAnimations}
          />

          <OptimizationOption
            title="Асинхронная подгрузка обложек"
            checked={asyncCoverLoading}
            onCheckedChange={setAsyncCoverLoading}
          />

          <OptimizationOption
            title="Сжатие изображений при импорте"
            checked={compressImages}
            onCheckedChange={setCompressImages}
          />

          <OptimizationOption
            title="Оптимизация для ночного режима"
            checked={nightModeOptimization}
            onCheckedChange={setNightModeOptimization}
          />

          <OptimizationOption
            title="Отключить онлайн-функции при слабом интернете"
            checked={disableOnlineOnSlowInternet}
            onCheckedChange={setDisableOnlineOnSlowInternet}
          />
        </CardContent>
      </Card>

      {/* Clear Cache */}
      <Card>
        <CardContent className="p-4">
          <Button variant="outline" onClick={handleClearCache} className="w-full gap-2 bg-transparent">
            <Trash2 className="h-4 w-4" />
            Очистить кэш
          </Button>
          <p className="text-sm text-muted-foreground mt-2 text-center">Освободить место на устройстве</p>
        </CardContent>
      </Card>
    </div>
  )
}

interface OptimizationOptionProps {
  title: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function OptimizationOption({ title, checked, onCheckedChange }: OptimizationOptionProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-medium">{title}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

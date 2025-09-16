"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { X } from "lucide-react"

interface ReaderSettingsProps {
  isOpen: boolean
  onClose: () => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  fontFamily: string
  onFontFamilyChange: (family: string) => void
  lineSpacing: number
  onLineSpacingChange: (spacing: number) => void
  backgroundColor: string
  onBackgroundColorChange: (color: string) => void
}

export function ReaderSettings({
  isOpen,
  onClose,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  lineSpacing,
  onLineSpacingChange,
  backgroundColor,
  onBackgroundColorChange,
}: ReaderSettingsProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reader Settings</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Font Size</label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => onFontSizeChange(value[0])}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>A</span>
              <span className="text-lg">A</span>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Font</label>
            <div className="grid grid-cols-3 gap-2">
              {["sans", "serif", "mono"].map((font) => (
                <Button
                  key={font}
                  variant={fontFamily === font ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFontFamilyChange(font)}
                  className="capitalize"
                >
                  {font}
                </Button>
              ))}
            </div>
          </div>

          {/* Line Spacing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Line Spacing</label>
              <span className="text-sm text-muted-foreground">{lineSpacing.toFixed(1)}</span>
            </div>
            <Slider
              value={[lineSpacing]}
              onValueChange={(value) => onLineSpacingChange(value[0])}
              min={1.2}
              max={2.0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <div className="flex flex-col gap-0.5">
                <div className="h-0.5 bg-current"></div>
                <div className="h-0.5 bg-current"></div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-0.5 bg-current"></div>
                <div className="h-0.5 bg-current"></div>
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Background Color</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={backgroundColor === "white" ? "default" : "outline"}
                size="sm"
                onClick={() => onBackgroundColorChange("white")}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 bg-white border rounded"></div>
                Light
              </Button>
              <Button
                variant={backgroundColor === "sepia" ? "default" : "outline"}
                size="sm"
                onClick={() => onBackgroundColorChange("sepia")}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 bg-amber-50 border rounded"></div>
                Sepia
              </Button>
              <Button
                variant={backgroundColor === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => onBackgroundColorChange("dark")}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 bg-gray-900 border rounded"></div>
                Dark
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

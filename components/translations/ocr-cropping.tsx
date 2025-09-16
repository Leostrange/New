"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface OCRCroppingProps {
  onBack: () => void
}

export function OCRCropping({ onBack }: OCRCroppingProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [cropArea, setCropArea] = useState({
    x: 50,
    y: 100,
    width: 300,
    height: 200,
  })

  const handleConfirm = () => {
    // TODO: Implement OCR processing
    alert("OCR обработка запущена")
    onBack()
  }

  return (
    <div className="p-4 space-y-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          Отмена
        </Button>
        <h1 className="text-lg font-semibold">OCR Cropping</h1>
        <Button onClick={handleConfirm}>Подтвердить</Button>
      </div>

      {/* Image with Crop Area */}
      <div className="flex-1 relative bg-muted rounded-lg overflow-hidden">
        {/* Sample text content */}
        <div className="p-6 text-sm leading-relaxed">
          <p className="mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum metus cursus quis, varius ultricies eget
            massa pharetra lectus. Mauris eu urna a nisl. Aliquam nunc at sit, vulputar posuere pulvinar at justo.
            Mauris porta bibendum, consequat at magna lectus nulla porttitor. Nam netus placerat in leo. Nulla molestie,
            posuere, gravida pharetra ut pulvinar.
          </p>
          <p className="mb-4">
            Sed ut perspiciatis ultricies et pellentesque elit accumsan mollis sodales eget urna quis.
          </p>
        </div>

        {/* Crop Selection Overlay */}
        <div
          className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10"
          style={{
            left: cropArea.x,
            top: cropArea.y,
            width: cropArea.width,
            height: cropArea.height,
          }}
        >
          {/* Corner handles */}
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize" />
        </div>
      </div>
    </div>
  )
}

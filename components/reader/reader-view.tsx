"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, X, Menu } from "lucide-react"
import { ReaderMenu } from "./reader-menu"
import { ReaderSettings } from "./reader-settings"

interface ReaderViewProps {
  onClose: () => void
}

const mockContent = `The following morning I was awoken early by the sonorous pealing of the village church bell.

I raised the blinds, seeing golden sunlight break through the mist, casting its glow over the surrounding hedgerows and fields, and beyond, cresting the hill as a towering silhouette of chalk cliffs against the morning sky.

I strolled along a gravel path leading to a small countryside inn. The crunch of gravel beneath my boots, the fresh morning air carried the scent of grass and the soft breeze on my face, savored in the scene.

A few early risers were scattered across the green lawn, some reading newspapers while sipping their morning tea, others engaged in quiet conversation about the day ahead.

The inn itself was a charming stone building, its walls covered in ivy that had turned brilliant shades of red and gold with the autumn season. Smoke curled lazily from the chimney, promising warmth and comfort within.

As I approached the entrance, the heavy wooden door creaked open, revealing a cozy interior filled with the aroma of freshly baked bread and brewing coffee. The innkeeper, a kindly woman with silver hair, greeted me with a warm smile.

"Good morning, traveler," she said, her voice carrying the gentle accent of the countryside. "You're up early today. Would you care for some breakfast?"

I nodded gratefully, taking a seat by the window where I could continue to admire the peaceful morning landscape while enjoying a hearty meal.`

export function ReaderView({ onClose }: ReaderViewProps) {
  const [currentPage, setCurrentPage] = useState(4)
  const [totalPages] = useState(15)
  const [showControls, setShowControls] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("serif")
  const [lineSpacing, setLineSpacing] = useState(1.6)
  const [backgroundColor, setBackgroundColor] = useState("white")

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const getBackgroundClass = () => {
    switch (backgroundColor) {
      case "sepia":
        return "bg-amber-50 text-amber-900"
      case "dark":
        return "bg-gray-900 text-gray-100"
      default:
        return "bg-white text-gray-900"
    }
  }

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "sans":
        return "font-sans"
      case "mono":
        return "font-mono"
      default:
        return "font-serif"
    }
  }

  return (
    <div className={`relative h-full ${getBackgroundClass()}`}>
      {/* Header */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Глава 3</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowMenu(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
                <span className="ml-2">Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Reading Area */}
      <div
        className="h-full flex items-center justify-center p-4 cursor-pointer"
        onClick={() => setShowControls(!showControls)}
      >
        <div className={`max-w-4xl w-full h-full rounded-lg shadow-lg p-8 overflow-auto ${getBackgroundClass()}`}>
          <div
            className={`${getFontFamilyClass()} leading-relaxed`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineSpacing,
            }}
          >
            {mockContent.split("\n\n").map((paragraph, index) => (
              <p key={index} className="mb-6">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 1}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(currentPage / totalPages) * 100}%` }}
                />
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === totalPages}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Reader Menu */}
      <ReaderMenu
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        onOpenSettings={() => {
          setShowMenu(false)
          setShowSettings(true)
        }}
      />

      {/* Reader Settings */}
      <ReaderSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        fontFamily={fontFamily}
        onFontFamilyChange={setFontFamily}
        lineSpacing={lineSpacing}
        onLineSpacingChange={setLineSpacing}
        backgroundColor={backgroundColor}
        onBackgroundColorChange={setBackgroundColor}
      />
    </div>
  )
}

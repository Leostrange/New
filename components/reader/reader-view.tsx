"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, X, Menu } from "lucide-react"
import { ReaderMenu } from "./reader-menu"
import { ReaderSettings } from "./reader-settings"
import { ExitConfirmDialog } from "./exit-confirm-dialog"

interface ReaderViewProps {
  onClose: () => void
}

interface ComicPage {
  id: string
  pageNumber: number
  imageUrl: string
  text?: string
}

const sampleComicPages: ComicPage[] = [
  {
    id: "page_1",
    pageNumber: 1,
    imageUrl: "/comic-book-page-1-superhero-action.jpg",
    text: "In the bustling city of New York, our hero begins their journey...",
  },
  {
    id: "page_2",
    pageNumber: 2,
    imageUrl: "/comic-book-page-2-city-skyline-night.jpg",
    text: "The night sky illuminated the towering skyscrapers as danger lurked in the shadows...",
  },
  {
    id: "page_3",
    pageNumber: 3,
    imageUrl: "/comic-book-page-3-villain-confrontation.jpg",
    text: "Face to face with their greatest enemy, our hero must make a choice...",
  },
  {
    id: "page_4",
    pageNumber: 4,
    imageUrl: "/comic-book-page-4-epic-battle-scene.jpg",
    text: "The battle rages on as powers clash in an epic confrontation...",
  },
  {
    id: "page_5",
    pageNumber: 5,
    imageUrl: "/comic-book-page-5-victory-celebration.jpg",
    text: "Victory is achieved, but at what cost? The story continues...",
  },
]

export function ReaderView({ onClose }: ReaderViewProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [pages] = useState(sampleComicPages)
  const [showControls, setShowControls] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [showExitDialog, setShowExitDialog] = useState(false)

  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("serif")
  const [lineSpacing, setLineSpacing] = useState(1.6)
  const [backgroundColor, setBackgroundColor] = useState("white")

  useEffect(() => {
    const progress = ((currentPage + 1) / pages.length) * 100
    setReadingProgress(progress)

    // Save progress to localStorage
    localStorage.setItem(
      "comic_progress",
      JSON.stringify({
        currentPage,
        progress,
        timestamp: Date.now(),
      }),
    )
  }, [currentPage, pages.length])

  useEffect(() => {
    const savedProgress = localStorage.getItem("comic_progress")
    if (savedProgress) {
      try {
        const { currentPage: savedPage } = JSON.parse(savedProgress)
        if (savedPage >= 0 && savedPage < pages.length) {
          setCurrentPage(savedPage)
        }
      } catch (e) {
        console.error("Failed to load saved progress:", e)
      }
    }
  }, [pages.length])

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleExit = () => {
    if (readingProgress > 10 && readingProgress < 100) {
      setShowExitDialog(true)
    } else {
      onClose()
    }
  }

  const confirmExit = () => {
    setShowExitDialog(false)
    onClose()
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") {
        prevPage()
      } else if (e.key === "ArrowRight" || e.key === "d") {
        nextPage()
      } else if (e.key === "Escape") {
        handleExit()
      } else if (e.key === " ") {
        e.preventDefault()
        setShowControls(!showControls)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentPage, pages.length, showControls, readingProgress])

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

  const currentPageData = pages[currentPage]

  if (!currentPageData) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Страница не найдена</p>
          <Button onClick={onClose} className="mt-4">
            Вернуться в библиотеку
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative h-full ${getBackgroundClass()}`}>
      {/* Header */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleExit} className="bg-background/80">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              <h1 className="text-lg font-semibold">Глава 3 - Страница {currentPage + 1}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{Math.round(readingProgress)}% прочитано</span>
              <Button variant="ghost" size="sm" onClick={() => setShowMenu(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleExit}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
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
        <div className={`max-w-4xl w-full h-full rounded-lg shadow-lg overflow-hidden ${getBackgroundClass()}`}>
          <img
            src={currentPageData.imageUrl || "/placeholder.svg?height=800&width=600&query=comic book page"}
            alt={`Page ${currentPage + 1}`}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Bottom Controls */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 0}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {currentPage + 1} / {pages.length}
              </span>
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${readingProgress}%` }}
                />
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === pages.length - 1}>
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
        currentPage={currentPage}
        totalPages={pages.length}
        onGoToPage={setCurrentPage}
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

      <ExitConfirmDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirm={confirmExit}
        progress={readingProgress}
        currentPage={currentPage + 1}
        totalPages={pages.length}
      />
    </div>
  )
}
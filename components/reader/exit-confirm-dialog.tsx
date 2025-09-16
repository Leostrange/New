"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock } from "lucide-react"

interface ExitConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  progress: number
  currentPage: number
  totalPages: number
}

export function ExitConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  progress,
  currentPage,
  totalPages,
}: ExitConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Выйти из чтения?
          </DialogTitle>
          <DialogDescription>Ваш прогресс будет сохранен автоматически</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Прогресс чтения</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>
                Страница {currentPage} из {totalPages}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Сохранено</span>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            Вы можете продолжить чтение с этого места в любое время
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Продолжить чтение
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            Выйти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

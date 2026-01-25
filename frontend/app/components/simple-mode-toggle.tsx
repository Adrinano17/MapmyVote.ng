"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { cn } from "@/lib/utils"

interface SimpleModeToggleProps {
  simpleMode: boolean
  onToggle: (enabled: boolean) => void
  className?: string
}

export function SimpleModeToggle({ simpleMode, onToggle, className }: SimpleModeToggleProps) {
  const { language } = useLanguage()

  const label =
    language === "yo"
      ? "Ọ̀nà Rọrùn"
      : language === "pcm"
      ? "Simple Mode"
      : language === "ha"
      ? "Yanayin Sauƙi"
      : language === "ig"
      ? "Ụdị Dị Mfe"
      : "Simple Mode"

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onToggle(!simpleMode)}
      className={cn("gap-2", className)}
      aria-label={label}
    >
      {simpleMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )
}










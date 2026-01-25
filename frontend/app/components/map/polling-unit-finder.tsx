"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { validatePollingUnitCode, findPollingUnitByCode } from "@/lib/polling-unit-validator"
import type { PollingUnit, Ward } from "@/lib/types"
import { Search, MapPin, CheckCircle, AlertCircle } from "lucide-react"

interface PollingUnitFinderProps {
  onPollingUnitFound: (pollingUnit: PollingUnit, ward: Ward) => void
}

export function PollingUnitFinder({ onPollingUnitFound }: PollingUnitFinderProps) {
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [foundUnit, setFoundUnit] = useState<{ pollingUnit: PollingUnit; ward: Ward } | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const supabase = createClient()

  const handleSearch = async () => {
    setError(null)
    setFoundUnit(null)
    setIsSearching(true)

    const validation = validatePollingUnitCode(code)

    if (!validation.isValid) {
      setError(validation.error || "Invalid code format")
      setIsSearching(false)
      return
    }

    try {
      const result = await findPollingUnitByCode(validation.wardCode!, validation.puCode!, supabase)

      if (!result) {
        setError(`Polling unit ${validation.fullCode} not found`)
        setIsSearching(false)
        return
      }

      setFoundUnit({
        pollingUnit: result.pollingUnit,
        ward: result.ward,
      })
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleConfirm = () => {
    if (foundUnit) {
      onPollingUnitFound(foundUnit.pollingUnit, foundUnit.ward)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Find Your Polling Unit
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter your 5-digit polling unit code (2 digits for ward + 3 digits for polling unit)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="pu-code" className="text-sm font-medium">
            Polling Unit Code
          </label>
          <div className="flex gap-2">
            <Input
              id="pu-code"
              placeholder="e.g., 01001"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 5)
                setCode(value)
                setError(null)
                setFoundUnit(null)
              }}
              maxLength={5}
              className="font-mono text-lg tracking-wider"
            />
            <Button onClick={handleSearch} disabled={code.length !== 5 || isSearching}>
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Format: WW-PPP (Ward code + Polling unit code)</p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        {foundUnit && (
          <div className="space-y-3">
            <div className="rounded-lg border border-green-500/50 bg-green-50 dark:bg-green-950/30 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                  Polling unit found!
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Ward</p>
                <p className="font-medium">
                  {foundUnit.ward.name} (Code: {foundUnit.ward.code})
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Polling Unit</p>
                <p className="font-medium">{foundUnit.pollingUnit.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm">{foundUnit.pollingUnit.address || "Ibadan North LGA"}</p>
              </div>
            </div>

            <Button onClick={handleConfirm} className="w-full">
              Navigate to This Polling Unit
            </Button>
          </div>
        )}

        {/* Sample codes helper */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Sample codes to try:</p>
          <div className="flex flex-wrap gap-2">
            {["01001", "02001", "03001", "04001", "05001"].map((sampleCode) => (
              <button
                key={sampleCode}
                onClick={() => {
                  setCode(sampleCode)
                  setError(null)
                  setFoundUnit(null)
                }}
                className="text-xs font-mono px-2 py-1 rounded bg-secondary hover:bg-secondary/80 transition-colors"
              >
                {sampleCode}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


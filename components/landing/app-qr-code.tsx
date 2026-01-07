'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { QrCode, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AppQRCode() {
  const [showQR, setShowQR] = useState(false)
  const appUrl = 'https://household-expense-tracker.vercel.app'

  if (showQR) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="bg-card rounded-2xl p-8 max-w-sm w-full mx-4 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => setShowQR(false)}
          >
            <X className="h-5 w-5" />
          </Button>

          <h2 className="text-xl font-bold text-center mb-2">
            Scan to Open
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Household Expense Tracker
          </p>

          <div className="bg-white p-4 rounded-xl mx-auto w-fit">
            <QRCodeSVG
              value={appUrl}
              size={220}
              level="H"
              includeMargin={false}
            />
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4 break-all">
            {appUrl}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 gap-2 bg-card/80 backdrop-blur-sm"
      onClick={() => setShowQR(true)}
    >
      <QrCode className="h-4 w-4" />
      Scan to Join
    </Button>
  )
}

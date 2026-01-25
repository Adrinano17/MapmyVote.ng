import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/hooks/use-language"
import { AIAssistant } from "@/components/ai-assistant"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MapMyVote.ng - Find Your Polling Unit",
  description:
    "Easily locate your assigned polling unit in Ibadan North Local Government Area. Search by name, voter ID, or ward with multilingual voice support.",
  keywords: ["polling unit", "voter", "election", "Nigeria", "Ibadan", "INEC", "voting location"],
  authors: [{ name: "MapMyVote.ng" }],
  openGraph: {
    title: "MapMyVote.ng - Find Your Polling Unit",
    description: "Easily locate your assigned polling unit in Ibadan North Local Government Area.",
    type: "website",
    locale: "en_NG",
  },
}

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <AIAssistant />
          </LanguageProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

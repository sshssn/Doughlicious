import "../styles/globals.css"
import { ReactNode } from "react"
import { Inter, Outfit } from "next/font/google"
import { ClientProviders } from "../components/shared/ClientProviders"
import { ConditionalNavBar } from "../components/shared/ConditionalNavBar"
import { ConditionalFooter } from "../components/shared/ConditionalFooter"
import type { Metadata, Viewport } from "next"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Doughlicious - Happiness Delivered Fresh",
  description: "Artisan donuts crafted with premium ingredients, baked fresh every morning.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`} style={{ margin: 0, padding: 0 }}>
        <ClientProviders>
          <ConditionalNavBar />
          {children}
          <ConditionalFooter />
        </ClientProviders>
      </body>
    </html>
  )
}
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Holi 2025 Celebration",
  description: "Join us for a colorful Holi celebration in 2025!",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-b from-purple-400 via-pink-500 to-red-500">{children}</main>
      </body>
    </html>
  )
}


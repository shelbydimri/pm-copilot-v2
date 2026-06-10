import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/shared/Sidebar'
import { Providers } from '@/components/shared/Providers'

export const metadata: Metadata = {
  title: 'PM Copilot',
  description: 'AI-powered PM assistant for individuals and teams',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 lg:p-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
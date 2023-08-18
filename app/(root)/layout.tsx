import '../globals.css'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import Topbar from '@/components/shared/Topbar'
import Bottombar from '@/components/shared/Bottombar'
import LeftSidebar from '@/components/shared/LeftSidebar'
import RightSidebar from '@/components/shared/RightSidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Threads',
  description: 'Made by ❤️',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
      <body className={inter.className}>
        <Topbar />
        <main>
          <LeftSidebar />
            <section className='main-content'>
              <div className='w-full max-w-4xl'>
                {children}
              </div>
            </section>
          <RightSidebar />
        </main>
        <Bottombar />
        </body>
    </html>
    </ClerkProvider>
  )
}

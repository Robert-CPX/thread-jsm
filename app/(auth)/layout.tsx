import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'
import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Threads',
  description: 'Made by ❤️',
}

const RootLayout = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <ClerkProvider>
      <html lang="en">
      <body className={`${inter.className} bg-dark-1`}>{children}</body>
    </html>
    </ClerkProvider>
  )
}

export default RootLayout;
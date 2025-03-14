"use client"

import { SessionHandler } from "@/components/session-handler"

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SessionHandler />
      {children}
    </>
  )
} 
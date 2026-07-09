"use client"

import { useMemo } from "react"
import Session from "./session"

export default function Page() {
  const sessionId = useMemo(() => crypto.randomUUID(), [])
  return (
    <Session sessionId={sessionId} />
  )
}
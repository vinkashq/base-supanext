"use client"

import { useCurrentUser } from "@/hooks/use-current-user"

import AccountMenu from "./account-menu"
import GuestMenu from "./guest-menu"

export default function UserMenu() {
  const user = useCurrentUser()
  if (!user) return <GuestMenu />
  return <AccountMenu />
}
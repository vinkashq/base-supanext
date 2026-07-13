"use client"

import { Button } from "@/components/ui/button"
import { Item, ItemActions, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { useCurrentUser } from "@/hooks/use-current-user"
import { createClient } from "@/lib/supabase/browser"
import { Mail, RectangleEllipsis } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export default function SettingsForm() {
  const currentUser = useCurrentUser()
  const [sendingPasswordResetEmail, setSendingPasswordResetEmail] = useState(false)

  function resetPassword() {
    setSendingPasswordResetEmail(true)

    if (!currentUser || !currentUser.email) {
      console.error("No user or email found")
      setSendingPasswordResetEmail(false)
      return
    }

    const supabase = createClient()
    supabase.auth.resetPasswordForEmail(currentUser.email)
      .then(() => {
        toast.success("Password reset email sent successfully")
      })
      .catch((err) => {
        console.error(err)
        toast.error("Failed to send password reset email")
      })
      .finally(() => {
        setSendingPasswordResetEmail(false)
      })
  }

  if (!currentUser) {
    return <div className="mx-auto max-w-4xl">Loading...</div>
  }

  return (
    <ItemGroup className="gap-4">
      <Item variant="outline">
        <ItemMedia>
          <Mail />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Email Address</ItemTitle>
          <ItemDescription>{currentUser.email}</ItemDescription>
        </ItemContent>
        <ItemFooter className="text-muted-foreground">
          We use your email address to send you important notifications and security updates.
        </ItemFooter>
      </Item>

      <Item variant="outline">
        <ItemMedia>
          <RectangleEllipsis />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Password</ItemTitle>
        </ItemContent>
        <ItemActions>
          <Button variant="outline" size="sm" className="group font-normal" onClick={resetPassword} disabled={sendingPasswordResetEmail}>
            <Spinner data-icon="inline-start" className="hidden group-disabled:block" />
            Send Password Reset Email
          </Button>
        </ItemActions>
        <ItemFooter className="text-muted-foreground">
          We will send you an email to change your password.
        </ItemFooter>
      </Item>
    </ItemGroup>
  )
}
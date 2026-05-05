'use client'

import { Button } from '@/components/ui/button'
import { useLogout } from '@/hooks/use-logout'

export function LogoutButton() {
  const { logout, isPending } = useLogout()

  return <Button onClick={() => logout()} disabled={isPending}>
    {isPending ? "Logging out..." : "Logout"}
  </Button>
}

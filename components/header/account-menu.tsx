'use client'

import { CurrentUserAvatar } from '../current-user-avatar'
import { useLogout } from '@/hooks/use-logout'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'

export default function AccountMenu() {
  const { logout, isPending } = useLogout()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <CurrentUserAvatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => logout()} disabled={isPending}>{isPending ? 'Logging out...' : 'Logout'}</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
'use client'

import { useCurrentUser } from '@/hooks/use-current-user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const CurrentUserAvatar = () => {
  const user = useCurrentUser()
  if (!user) return null

  const metadata = user.user_metadata
  const profileImage: string = metadata.avatar_url
  const name: string = metadata.full_name || user.email || ""
  let initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')

  if (initials.length === 1) {
    initials = `${initials}${name.slice(1, 2)}`
  }
  initials = initials.toUpperCase()

  return (
    <Avatar>
      {profileImage && <AvatarImage src={profileImage} alt={initials} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

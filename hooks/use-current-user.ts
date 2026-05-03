import { useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | undefined>()

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await createClient().auth.getSession()
      if (error) {
        console.error(error)
      }

      setUser(data.session?.user)
    }

    fetchUser()
  }, [])

  return user
}

export const useCurrentUserName = () => {
  const user = useCurrentUser()
  if (!user) return null
  return user.user_metadata.full_name as string
}

export const useCurrentUserImage = () => {
  const user = useCurrentUser()
  if (!user) return null
  return user.user_metadata.avatar_url as string
}
